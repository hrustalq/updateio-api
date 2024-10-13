import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreatePatchNoteDto {
  @ApiProperty({
    description: 'Заголовок патч-нота',
    example: 'Обновление 2.0',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Содержание патч-нота',
    example: 'В этом обновлении мы добавили новые функции...',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Версия обновления',
    example: '2.0.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({
    description: 'Дата выпуска патча',
    example: '2023-04-01T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  releaseDate: string;

  @ApiProperty({
    description: 'ID игры, к которой относится патч-нот',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  gameId: string;

  @ApiProperty({
    description: 'ID приложения, к которому относится игра',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  appId: string;
}
