import {
  Controller,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  HttpCode,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBody,
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ConformCodeDto } from './dto/confirm-code.dto';

@ApiTags('Аутентификация / авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiCreatedResponse({
    description: 'Пользователь успешно зарегистрирован',
    headers: {
      'Set-Cookie': {
        description: 'AccessToken и RefreshToken устанавливаются в куки',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные для регистрации' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @ApiBody({ type: RegisterDto, description: 'Параметры регистрации' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.register(registerDto);
    await this.authService.login(user, response);
    return { message: 'Пользователь успешно зарегистрирован' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Вход пользователя в систему' })
  @ApiOkResponse({
    description: 'Пользователь успешно авторизован',
    headers: {
      'Set-Cookie': {
        description: 'AccessToken и RefreshToken устанавливаются в куки',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неверные данные для входа' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @ApiBody({ type: LoginDto, description: 'Параметры авторизации' })
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiCookieAuth('AccessToken')
  @ApiOperation({ summary: 'Обновление токенов доступа' })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
    headers: {
      'Set-Cookie': {
        description: 'Новые AccessToken и RefreshToken устанавливаются в куки',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Невалидный или просроченный RefreshToken',
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('AccessToken')
  @ApiOperation({ summary: 'Выход пользователя из системы' })
  @ApiOkResponse({ description: 'Пользователь успешно вышел из системы' })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user, response);
  }

  @Post('login/telegram')
  @ApiOperation({ summary: 'Вход через Telegram' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Telegram Web App Data (format: "tma <initDataRaw>")',
  })
  @ApiResponse({
    status: 201,
    description: 'Успешная аутентификация через Telegram',
  })
  @ApiUnauthorizedResponse({ description: 'Неверные данные для входа' })
  async loginTelegram(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.login(user, res);
    return { message: 'Успешная аутентификация через Telegram' };
  }

  @Post('qr-code/generate')
  @Public()
  @ApiOperation({ summary: 'Генерация QR-кода для авторизации' })
  @ApiResponse({ status: 201, description: 'QR-код успешно сгенерирован' })
  async generateQRCode() {
    const code = await this.authService.generateQRCode();
    return { code };
  }

  @Post('qr-code/confirm')
  @ApiOperation({ summary: 'Подтверждение авторизации по QR-коду' })
  @ApiResponse({
    status: 200,
    description: 'Авторизация по QR-коду подтверждена',
  })
  @ApiBody({ type: () => ConformCodeDto, description: 'Код подтверждения' })
  async confirmQRCode(@Body() code: string, @CurrentUser() user: User) {
    await this.authService.confirmQRCode(user, code);
    return { message: 'QR code confirmed successfully' };
  }

  @Post('qr-code/login')
  @Public()
  @ApiOperation({ summary: 'Авторизация по QR-коду' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация по QR-коду' })
  async loginWithQRCode(
    @Body('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.loginWithQRCode(code);
    await this.authService.login(user, response);
    return { message: 'Успешная авторизация по QR-коду' };
  }
}
