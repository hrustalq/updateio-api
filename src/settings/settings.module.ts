import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { AppsModule } from 'src/apps/apps.module';
import { GamesModule } from 'src/games/games.module';

@Module({
  imports: [AppsModule, GamesModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
