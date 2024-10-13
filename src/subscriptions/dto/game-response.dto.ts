import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsUUID } from 'class-validator';

export class GameResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор игры' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Название игры' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL изображения игры' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;
}
