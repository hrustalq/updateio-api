import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, S3Service],
  exports: [GamesService],
})
export class GamesModule {}
