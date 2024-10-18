import { ApiProperty } from '@nestjs/swagger';
import { Settings as SettingsModel } from '@prisma/client';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class Settings implements SettingsModel {
  @ApiProperty({
    description: 'ID настроек',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ID приложения',
    example: 'app123',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  appId: string;

  @ApiProperty({
    description: 'ID игры',
    example: 'game456',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({
    description: 'Название приложения, которое вызывает обновление',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  executorName: string;

  @ApiProperty({
    description: 'Команда, запускающая обновление',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  updateCommand: string;
}
