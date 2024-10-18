import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'ID Приложения для привязки настроек',
    type: 'string',
    example: 'cm290opm9000411j214og5yij',
  })
  @IsString()
  @IsOptional()
  appId?: string;

  @ApiProperty({
    description: 'ID Игры для привязки настроек',
    type: 'string',
    example: '0dc3564a-4511-4b74-a070-61dc1d07ec12',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  gameId?: string;

  @ApiProperty({
    description: 'Название сервиса, вызывающего обновление',
    type: 'string',
    example: 'steam',
  })
  @IsString()
  @IsOptional()
  executorName?: string;

  @ApiProperty({
    description: 'Команда для вызова обновления',
    type: 'string',
    example: '+login anonymous +app_update 90 validate +quit',
  })
  @IsString()
  @IsOptional()
  updateCommand?: string;
}
