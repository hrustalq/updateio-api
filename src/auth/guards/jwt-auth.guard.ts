import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      const refreshToken = request.cookies?.RefreshToken;

      if (refreshToken) {
        return this.authService
          .refreshTokens(refreshToken, response)
          .then((refreshedUser) => {
            // Устанавливаем пользователя в request, чтобы @CurrentUser работал
            request.user = refreshedUser;
            return refreshedUser;
          })
          .catch(() => {
            throw err || new UnauthorizedException();
          });
      }
    }
    return user;
  }
}
