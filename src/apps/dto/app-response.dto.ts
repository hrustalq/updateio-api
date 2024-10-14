import { ApiProperty } from '@nestjs/swagger';
import { App } from '../entities/app.entity';

export class AppResponseDto {
  @ApiProperty({ type: [App], description: 'Array of apps' })
  data: App[];

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  perPage: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  pageCount: number;
}
