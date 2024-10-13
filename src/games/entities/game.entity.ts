import { ApiProperty } from '@nestjs/swagger';
import { Game as GameModel } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class Game implements GameModel {
  @ApiProperty({
    description: 'ID игры',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Название игры', example: 'Counter-Strike 2' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'ID приложения за которым привязана игра',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  appId: string | null;

  @ApiProperty({
    default: 'URL Изображения',
    example: 'http://example.com/image.webp',
    required: false,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  image: string | null;

  @ApiProperty({ description: 'Версия игры', example: 2.0, required: false })
  @IsNumber()
  @IsOptional()
  version: number | null;
}
