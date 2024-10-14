import { ApiProperty } from '@nestjs/swagger';
import { Game } from '../entities/game.entity';

export class GetGamesResponseDto {
  @ApiProperty({ type: [Game], description: 'Список игр' })
  data: Game[];

  @ApiProperty({ example: 1, description: 'Текущий номер страницы' })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Количество записей для одной страницы',
  })
  perPage: number;

  @ApiProperty({ example: 100, description: 'Общее количество записей' })
  total: number;

  @ApiProperty({ example: 10, description: 'Общее количество страниц' })
  pageCount: number;
}
