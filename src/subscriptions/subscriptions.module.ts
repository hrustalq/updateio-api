import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserCacheReflector } from '../common/reflectors/user-cache.reflector';
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppsModule } from 'src/apps/apps.module';
import { GamesModule } from 'src/games/games.module';

@Module({
  imports: [
    PrismaModule,
    AppsModule,
    GamesModule,
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'subscriptions',
            type: 'topic',
          },
        ],
        uri: configService.getOrThrow<string>('RABBITMQ_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, UserCacheReflector, UserCacheInterceptor],
})
export class SubscriptionsModule {}
