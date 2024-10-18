import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  ForbiddenResponseDto,
  InternalServerErrorResponseDto,
  NotFoundResponseDto,
} from '../dto/error-response.dto';

export function ApiGlobalErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request',
      type: BadRequestResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      type: NotFoundResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ForbiddenResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      type: InternalServerErrorResponseDto,
    }),
  );
}
