import { ApiProperty } from '@nestjs/swagger';
import { PatchNote as PatchNoteModel } from '@prisma/client';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class PatchNote implements PatchNoteModel {
  @ApiProperty({
    description: 'ID патч-нота',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Заголовок патч-нота',
    example: 'Обновление 2.0',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Содержание патч-нота',
    example: 'В этом обновлении мы добавили новые функции...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Версия обновления',
    example: '2.0.1',
    required: false,
  })
  @IsString()
  @IsOptional()
  version: string | null;

  @ApiProperty({ description: 'Дата выпуска патча' })
  @IsDate()
  releaseDate: Date;

  @ApiProperty({
    description: 'ID игры, к которой относится патч-нот',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({
    description: 'ID приложения, к которой относится игра',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  appId: string;

  @ApiProperty({ description: 'Дата создания записи' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления записи' })
  @IsDate()
  updatedAt: Date;
}
