import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramUser {
  @ApiProperty({ example: 99281932 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Ivan' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ivanov', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'Kryst4l320', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  languageCode: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  allowsWriteToPm?: boolean;
}

export class InitDataDto {
  @ApiProperty({
    description: 'Дата авторизации',
    example: 1653766846,
  })
  @IsNumber()
  authDate: number;

  @ApiProperty({
    description: 'Идентификатор чата',
    example: '8428209589180549439',
  })
  @IsString()
  @IsOptional()
  chatInstance?: string;

  @ApiProperty({
    description: 'Тип чата',
    example: 'sender',
  })
  @IsString()
  @IsOptional()
  chatType?: string;

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
  startParam?: string;

  @ApiProperty({
    description: 'Данные пользователя Telegram',
    type: TelegramUser,
  })
  @ValidateNested()
  @Type(() => TelegramUser)
  user: TelegramUser;
}
