import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (isPublic) {
      return user;
    }

    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    // Если пользователь не аутентифицирован, запретить д��ступ
    if (!user) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    // Если роли не определены в рефлекторе, разрешить доступ только для ADMIN
    if (!requiredRoles || requiredRoles.length === 0) {
      if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
      return user;
    }

    // Проверка, включена ли роль пользователя в список требуемых ролей
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return user;
  }
}
