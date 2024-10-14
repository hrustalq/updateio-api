import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { 
  BadRequestResponseDto, 
  ConflicResponseDto,
  UnauthorizedResponseDto, 
  ForbiddenResponseDto, 
  NotFoundResponseDto, 
  InternalServerErrorResponseDto 
} from '../dto/error-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? (exception.getResponse() as any).message || 'Something went wrong'
      : 'Internal server error';

    let errorResponse: 
      BadRequestResponseDto | 
      ConflicResponseDto |
      UnauthorizedResponseDto | 
      ForbiddenResponseDto | 
      NotFoundResponseDto | 
      InternalServerErrorResponseDto;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        errorResponse = new BadRequestResponseDto();
        break;
      case HttpStatus.UNAUTHORIZED:
        errorResponse = new UnauthorizedResponseDto();
        break;
      case HttpStatus.FORBIDDEN:
        errorResponse = new ForbiddenResponseDto();
        break;
      case HttpStatus.NOT_FOUND:
        errorResponse = new NotFoundResponseDto();
        break;
      case HttpStatus.CONFLICT:
        errorResponse = new ConflicResponseDto();
      default:
        errorResponse = new InternalServerErrorResponseDto();
    }

    errorResponse.statusCode = status;
    errorResponse.message = message;
    errorResponse.error = exception instanceof HttpException ? exception.message : 'Error';

    response.status(status).json(errorResponse);
  }
}
