import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { App } from 'src/apps/entities/app.entity';
import { Game } from 'src/games/entities/game.entity';

export class SubscriptionResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор подписки' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Статус подписки (активна/неактивна)' })
  @IsBoolean()
  isSubscribed: boolean;

  @ApiProperty({ description: 'Информация о приложении' })
  @ValidateNested()
  @Type(() => App)
  app: App;

  @ApiProperty({ description: 'Информация об игре' })
  @ValidateNested()
  @Type(() => Game)
  game: Game;
}
