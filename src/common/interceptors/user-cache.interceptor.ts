import {
  Injectable,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { UserCacheReflector } from '../reflectors/user-cache.reflector';

@Injectable()
export class UserCacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
    private userCacheReflector: UserCacheReflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.userCacheReflector.getCacheKey(context);
    if (!key) {
      return next.handle();
    }

    const value = await this.cacheManager.get(key);
    if (value) {
      return of(value);
    }

    return next.handle().pipe(
      tap((response) => {
        this.cacheManager.set(key, response);
      }),
    );
  }
}
