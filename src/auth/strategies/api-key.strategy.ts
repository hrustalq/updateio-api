import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly usersService: UsersService) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req: Request, token: string) {
    const apiKey = token || req.query.api_key || req.body.api_key;

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API Key'); // Пропускаем запрос без API-ключа
    }

    const user = await this.usersService.findByApiKey(apiKey);
    if (!user) {
      throw new UnauthorizedException('Invalid API Key'); // Пропускаем запрос с неверным API-ключом
    }
    return user;
  }
}
