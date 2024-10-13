import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    description: 'Название игры',
    example: 'Counter-Strike 2',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID приложений, к которым привязана игра',
    example: ['cm1tcu28u00007y09qgrm32hy', 'cm1tcu28u00007y09qgrm32hz'],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  appIds: string[];

  @ApiProperty({
    description: 'Версия игры',
    example: 2.0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  version?: number;

  @ApiProperty({
    description: 'Image file for the game',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;
}
