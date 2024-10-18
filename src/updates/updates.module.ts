import { Module } from '@nestjs/common';
import { UpdatesController } from './updates.controller';
import { UpdatesService } from './updates.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'updates',
            type: 'topic',
          },
        ],
        uri: configService.get<string>('RABBITMQ_URI'),
        channels: {
          'channel-1': {
            prefetchCount: 15,
            default: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UpdatesController],
  providers: [UpdatesService],
})
export class UpdatesModule {}
