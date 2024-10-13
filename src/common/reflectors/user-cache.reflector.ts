import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';

@Injectable()
export class UserCacheReflector extends Reflector {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getCacheKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const baseKey = this.reflector.get<string>(
      'cacheKey',
      context.getHandler(),
    );

    if (!baseKey || !user) {
      return null;
    }

    return `${baseKey}_${user.id}`;
  }
}
