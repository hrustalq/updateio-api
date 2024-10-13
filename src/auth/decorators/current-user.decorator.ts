import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';

export const getCurrentUserByContext = (context: ExecutionContext): User => {
  const request = context.switchToHttp().getRequest();
  // Проверяем наличие пользователя в запросе (установленного JWT или API-key стратегией)
  if (request.user) {
    return request.user;
  }

  // Если пользователь не найден ни одним из способов, выбрасываем исключение
  throw new UnauthorizedException('User not found in the request');
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
