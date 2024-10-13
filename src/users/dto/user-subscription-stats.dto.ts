import { ApiProperty } from '@nestjs/swagger';

export class UserSubscriptionStatsDto {
  @ApiProperty({ description: 'Общее количество подписок', example: 5 })
  totalSubscriptions: number;
}
