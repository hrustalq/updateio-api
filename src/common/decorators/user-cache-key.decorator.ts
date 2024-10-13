import { SetMetadata } from '@nestjs/common';

export const UserCacheKey = (key: string) => SetMetadata('cacheKey', key);
