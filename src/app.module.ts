import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GamesModule } from './games/games.module';
import { PatchNotesModule } from './patch-notes/patch-notes.module';
import { AppsModule } from './apps/apps.module';
import { S3Service } from './s3/s3.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { HttpClientModule } from './http-client/http-client.module';
import { CombinedAuthGuard } from './auth/guards/combined-auth.guard';
import { SettingsModule } from './settings/settings.module';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: configService.get('THROTTLER_TTL') || 60,
            limit: configService.get('THROTTLER_LIMIT') || 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    HttpClientModule,
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: async (configService: ConfigService) => ({
        store: (await redisStore({
          url: configService.getOrThrow<string>('API_REDIS_URL'),
        })) as unknown as CacheStore,
        ttl: parseInt(
          configService.getOrThrow<string>('API_REDIS_CACHE_TTL'),
          10,
        ),
        isGlobal: true,
        keyPrefix: 'api_cache:',
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    GamesModule,
    PatchNotesModule,
    SettingsModule,
    AppsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CombinedAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class AppModule {}
