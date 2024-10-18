import { ApiProperty } from '@nestjs/swagger';
import { UpdateRequest } from '../entities/update-request.entity';

export class GetUpdateRequestsResponseDto {
  @ApiProperty({ type: [UpdateRequest], description: 'Список игр' })
  data: UpdateRequest[];

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
