import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../entities/token-payload.entity';
import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.AccessToken,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_AT_SECRET'),
    });
  }
  async validate(payload: TokenPayload) {
    return this.usersService.findById(payload.userId);
  }
}
