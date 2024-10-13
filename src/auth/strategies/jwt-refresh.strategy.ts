import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../entities/token-payload.entity';
import { UsersService } from '../../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.RefreshToken,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_RT_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(request: Request, payload: TokenPayload) {
    if (!request.cookies?.RefreshToken)
      throw new UnauthorizedException('Токен отсутствует!');
    return this.authService.verifyUserRefreshToken(
      request.cookies?.RefreshToken,
      payload.userId,
    );
  }
}
