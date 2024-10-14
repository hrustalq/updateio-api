import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionResponseDto } from './subscription-response.dto';

export class GetSubscriptionsResponseDto {
  @ApiProperty({
    type: [SubscriptionResponseDto],
    description: 'Список подписок',
  })
  data: SubscriptionResponseDto[];

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
