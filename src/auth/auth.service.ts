import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { TokenData, TokenPayload } from './entities/token-payload.entity';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { InitDataDto } from './dto/init-data.dto';
import { QrCodeService } from './qr-code.service';
import { QrCodeGateway } from './qr-code.gateway';
import { validate } from '@telegram-apps/init-data-node';

@Injectable()
export class AuthService {
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly qrCodeService: QrCodeService,
    private readonly qrCodeGateway: QrCodeGateway,
  ) {}

  async verifyUserCredentials(
    username: string,
    password: string,
  ): Promise<User> {
    try {
      const find = await this.usersService.findByUsername(username);
      const passwordsMatch = await compare(password, find.passwordHash);

      if (!passwordsMatch)
        throw new UnauthorizedException('Неверная почта или пароль');

      return find;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw new UnauthorizedException('Неверная почта или пароль');
      }
      throw new InternalServerErrorException('Внутренняя ошибка сервера'); // Либо можно использовать `InternalServerErrorException`
    }
  }

  async login(user: User, response: Response) {
    const atExpiresIn = new Date(
      new Date().getTime() +
        parseInt(this.configService.get<string>('JWT_AT_EXP'), 10),
    );
    const rtExpiresIn = new Date(
      new Date().getTime() +
        parseInt(this.configService.get<string>('JWT_RT_EXP'), 10),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
      jti: uuidv4(),
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: this.configService.getOrThrow('JWT_AT_EXP'),
      secret: this.configService.getOrThrow<string>('JWT_AT_SECRET'),
    });
    const refreshToken = this.jwtService.sign(
      {
        ...tokenPayload,
        jti: uuidv4(),
      },
      {
        expiresIn: this.configService.getOrThrow('JWT_RT_EXP'),
        secret: this.configService.getOrThrow<string>('JWT_RT_SECRET'),
      },
    );

    // Устанавливаем куки
    response.cookie('AccessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: atExpiresIn,
      domain: this.configService.getOrThrow<string>('API_DOMAIN'),
    });
    response.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: rtExpiresIn,
      domain: this.configService.getOrThrow<string>('API_DOMAIN'),
    });

    // Сохраняем информацию о Refresh Token
    await this.saveRefreshToken(user.id, refreshToken, rtExpiresIn);
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ) {
    await this.cacheManager.set(
      `rt_${userId}`,
      token,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) throw new UnauthorizedException('Невалидный токен');
      const tokenBlacklisted = await this.verifyTokenBlackListed(
        refreshToken,
        userId,
      );
      if (tokenBlacklisted)
        throw new UnauthorizedException('Токен в чернм списке');
      await this.blacklistToken(refreshToken, userId);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Невалидный токен');
      }
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
  }

  async verifyTokenBlackListed(refreshToken: string, userId: string) {
    const existingBlacklistedTokenJti = await this.cacheManager.get(
      `rt_${userId}`,
    );
    if (!existingBlacklistedTokenJti) return false;
    const { jti } = this.jwtService.decode<TokenData>(refreshToken);
    return existingBlacklistedTokenJti === jti;
  }

  async blacklistToken(refreshToken: string, userId: string) {
    const { jti } = this.jwtService.decode<TokenData>(refreshToken);
    const ttlInSeconds = 30 * 24 * 60 * 60;
    await this.cacheManager.set(`rt_${userId}`, jti, ttlInSeconds);
  }

  async logout(user: User, response: Response) {
    const refreshToken = response.req.cookies['RefreshToken'];
    if (refreshToken) {
      await this.blacklistToken(refreshToken, user.id);
    }

    response.clearCookie('AccessToken', {
      domain: this.configService.getOrThrow<string>('API_DOMAIN'),
      expires: new Date(),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    response.clearCookie('RefreshToken', {
      domain: this.configService.getOrThrow<string>('API_DOMAIN'),
      expires: new Date(),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService
      .findById(registerDto.id)
      .catch(() => null);
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    // Generate random password if not provided
    const passwordHash = registerDto.password || this.generateRandomPassword();
    // Create the user
    const newUser = await this.usersService.create({
      id: registerDto.id,
      password: passwordHash,
      ...registerDto,
    });

    return newUser;
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async validateInitData(
    initData: InitDataDto,
    raw: string,
  ): Promise<User | null> {
    const isValid = await this.validateTelegramHash(raw);
    if (!isValid) {
      return null;
    }

    let user = await this.usersService.findById(initData.user.id.toString());
    if (!user) {
      // Если пользователь не существует, создаем нового
      user = await this.usersService.create({
        id: initData.user.id.toString(),
        username: initData.user.username,
        first_name: initData.user.first_name,
        last_name: initData.user.last_name,
        is_bot: false,
      });
    }

    return user;
  }

  private async validateTelegramHash(raw: string): Promise<boolean> {
    const botToken =
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in the configuration');
    }

    try {
      validate(raw, botToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  async loginWithInitData(
    initDataDto: InitDataDto,
    raw: string,
  ): Promise<User> {
    const isValid = this.validateTelegramHash(raw);

    if (!isValid) {
      throw new BadRequestException('Invalid Telegram data');
    }

    const { user } = initDataDto;

    const existingUser = await this.usersService.findById(user.id.toString());
    if (existingUser) {
      // Обновляем существующего пользователя
      return this.usersService.update(user.id.toString(), {
        first_name: user.first_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
      });
    } else {
      // Создаем нового пользователя
      const newUser = await this.usersService.create({
        id: user.id.toString(),
        first_name: user.first_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
        is_bot: false,
      });
      return newUser;
    }
  }

  async registerWithTelegram(
    initDataDto: InitDataDto,
    raw: string,
  ): Promise<User> {
    const isValid = this.validateTelegramHash(raw);

    if (!isValid) {
      throw new BadRequestException('Invalid Telegram data');
    }

    const { user } = initDataDto;
    const passwordHash = this.generateRandomPassword();

    const userDto: RegisterDto = {
      ...user,
      id: user.id.toString(),
      password: passwordHash,
      is_bot: false,
    };

    return this.usersService.create(userDto);
  }

  async generateQRCode(): Promise<string> {
    return this.qrCodeService.generateQRCode();
  }

  async confirmQRCode(user: User, code: string): Promise<void> {
    const status = await this.qrCodeService.checkQRCodeStatus(code);
    if (status !== 'PENDING') {
      throw new BadRequestException('Invalid or expired QR code');
    }
    await this.qrCodeService.confirmQRCode(user.id, code);
    await this.qrCodeGateway.sendQrCodeStatusUpdate(code, 'CONFIRMED');
  }

  async checkQRCodeStatus(code: string): Promise<string> {
    return this.qrCodeService.checkQRCodeStatus(code);
  }

  async loginWithQRCode(code: string): Promise<User> {
    const session = await this.qrCodeService.getQRCodeSession(code);
    if (!session || session.status !== 'CONFIRMED' || !session.user) {
      throw new UnauthorizedException(
        'Invalid QR code or session not confirmed',
      );
    }
    return session.user;
  }

  async refreshTokens(refreshToken: string, response: Response): Promise<User> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_RT_SECRET'),
      });

      const user = await this.usersService.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokenBlacklisted = await this.verifyTokenBlackListed(
        refreshToken,
        user.id,
      );
      if (tokenBlacklisted) {
        throw new UnauthorizedException('Token is blacklisted');
      }

      // Генерируем новые токены
      await this.login(user, response);

      // Обновляем время жизни Refresh Token (скользящее окно)
      const cookies = response.getHeader('Set-Cookie');
      const newRefreshToken = Array.isArray(cookies)
        ? cookies.find((cookie) => cookie.startsWith('RefreshToken='))
        : undefined;

      if (newRefreshToken) {
        await this.blacklistToken(refreshToken, user.id);
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
