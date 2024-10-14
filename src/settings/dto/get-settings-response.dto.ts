import { ApiProperty } from '@nestjs/swagger';
import { Settings } from '../entities/settings.entity';

export class GetSettingsResponseDto {
  @ApiProperty({ type: [Settings], description: 'Список настроек' })
  data: Settings[];

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
