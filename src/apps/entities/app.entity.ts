import { ApiProperty } from '@nestjs/swagger';
import { App as AppModel } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class App implements AppModel {
  @ApiProperty({
    description: 'ID приложения',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Название приложения', example: 'Steam' })
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
}
