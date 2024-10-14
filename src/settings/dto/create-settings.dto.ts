import { ApiProperty } from '@nestjs/swagger';
import { Settings } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSettingsDto implements Omit<Settings, 'id'> {
  @ApiProperty({ description: 'ID Приложения для привязки настроек' })
  @IsString()
  @IsNotEmpty()
  appId: string;

  @ApiProperty({ description: 'ID Игры для привязки настроек' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'Название сервиса, вызывающего обновление' })
  executorName: string;

  @ApiProperty({ description: 'Команда для вызова обновления', type: 'string', required: true })
  updateCommand: string;
}
