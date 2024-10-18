import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PatchNoteFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'ID игры для фильтрации',
    type: 'string',
    required: false,
    example: '0dc3564a-4511-4b74-a070-61dc1d07ec12',
  })
  gameId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'ID приложения для фильтрации',
    type: 'string',
    required: false,
    example: 'cm28mu2m70000h6fdo3czj3aa',
  })
  appId?: string;
}
