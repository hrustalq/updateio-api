import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramUser {
  @ApiProperty({ example: '99281932' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Ivan' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Ivanov' })
  @IsOptional()
  @IsString()
  last_name: string | null;

  @ApiProperty({ example: 'Kryst4l320', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  language_code: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_premium: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  allows_write_to_pm: boolean;
}

export class InitDataDto {
  @ApiProperty({
    description: 'Дата авторизации',
    example: '2024-05-28T19:00:46.000Z',
  })
  @IsDateString()
  auth_date: string;

  @ApiProperty({
    description: 'Идентификатор чата',
    example: '8428209589180549439',
  })
  @IsString()
  chat_instance: string;

  @ApiProperty({
    description: 'Тип чата',
    example: 'sender',
  })
  @IsString()
  chat_type: string;

  @ApiProperty({
    description: 'Хеш для проверки подлинности данных',
    example: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
  })
  @IsString()
  hash: string;

  @ApiProperty({
    description: 'Начальный параметр',
    example: 'debug',
  })
  @IsString()
  @IsOptional()
  start_param?: string;

  @ApiProperty({
    description: 'Данные пользователя Telegram',
    type: TelegramUser,
  })
  @ValidateNested()
  @Type(() => TelegramUser)
  user: TelegramUser;
}
