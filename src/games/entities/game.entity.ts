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
    example: 'https://example.com/image.jpg',
    description: 'Ссылка на изображение',
    nullable: true,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  image: string | null;

  @ApiProperty({ description: 'Версия игры', example: 2.0, required: false })
  @IsNumber()
  @IsOptional()
  version: number | null;
}
