import {
  createParamDecorator,
  ExecutionContext,
  applyDecorators,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

// Кастомный декоратор для извлечения параметров из запроса
export const PaginationQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;

    return { page, limit };
  },
);

// Совместный декоратор: обрабатывает пагинацию и добавляет Swagger документацию
export function PaginatedRequest() {
  return applyDecorators(
    // Swagger: добавление параметров в документацию
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Номер страницы',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество записей для одной страницы',
      example: 10,
    }),
  );
}
