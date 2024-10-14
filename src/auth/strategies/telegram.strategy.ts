import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { parse, validate } from '@telegram-apps/init-data-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('tma ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const initDataRaw = authHeader.slice(4);

    const initData = parse(initDataRaw);
    if (!initData?.user?.id) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    try {
      validate(
        initDataRaw,
        this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
      );
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid Credentials');
    }
    const user = await this.authService.validateInitData(initData);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return user;
  }
}
