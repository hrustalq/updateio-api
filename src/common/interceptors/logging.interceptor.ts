import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const userAgent = headers?.['user-agent'] || 'unknown';
    const ip = request.ip;

    this.logger.log(
      `[Request] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `[Response] ${method} ${url} - ${response.statusCode} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `[Response] ${method} ${url} - ${error.status} - ${delay}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
