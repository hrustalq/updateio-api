import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [AppsController],
  providers: [AppsService, S3Service],
  exports: [AppsService],
})
export class AppsModule {}
