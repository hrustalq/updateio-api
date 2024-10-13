import { Module } from '@nestjs/common';
import { PatchNotesService } from './patch-notes.service';
import { PatchNotesController } from './patch-notes.controller';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { HttpClientModule } from '../http-client/http-client.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppsModule } from 'src/apps/apps.module';
import { GamesModule } from 'src/games/games.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SubscriptionsModule,
    HttpClientModule,
    AppsModule,
    GamesModule,
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'patch-notes',
            type: 'topic',
          },
          {
            name: 'notifications',
            type: 'topic',
          },
        ],
        uri: configService.getOrThrow<string>('RABBITMQ_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PatchNotesController],
  providers: [PatchNotesService],
  exports: [PatchNotesService],
})
export class PatchNotesModule {}
