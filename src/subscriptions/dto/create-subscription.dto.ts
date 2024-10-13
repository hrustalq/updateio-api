import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID игры для подписки',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  gameId: string;

  @ApiProperty({
    description: 'ID приложения для подписки',
    example: 'cm1ylkvpw0000ghyluqi9cmey',
  })
  @IsNotEmpty()
  appId: string;

  @ApiProperty({
    description: 'Статус подписки',
    example: true,
  })
  @IsBoolean()
  isSubscribed: boolean;
}
