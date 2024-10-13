import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const url = request.url;

    const isLoginRoute = url === '/auth/login' || url === '/api/auth/login';
    const isTelegramLoginRoute =
      url === '/auth/login/telegram' || url === '/api/auth/login/telegram';
    const isTelegramRegisterRoute =
      url === '/auth/register/telegram' ||
      url === '/api/auth/register/telegram';
    const isRefreshRoute =
      url === '/auth/refresh' || url === '/api/auth/refresh';

    if (
      isPublic ||
      isLoginRoute ||
      isRefreshRoute ||
      isTelegramLoginRoute ||
      isTelegramRegisterRoute
    ) {
      return true;
    }

    return super.canActivate(context);
  }
}
