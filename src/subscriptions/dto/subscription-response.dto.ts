import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsUUID,
  ValidateNested,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class AppDto {
  @ApiProperty({ description: 'Уникальный идентификатор приложения' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Название приложения' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL изображения приложения' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  image: string;
}

class GameDto {
  @ApiProperty({ description: 'Уникальный идентификатор игры' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Название игры' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL изображения игры' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;
}

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
  @Type(() => AppDto)
  app: AppDto;

  @ApiProperty({ description: 'Информация об игре' })
  @ValidateNested()
  @Type(() => GameDto)
  game: GameDto;
}
