import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class GetUsersResponseDto {
  @ApiProperty({ type: [User], description: 'Список пользователей' })
  data: User[];

  @ApiProperty({ example: 1, description: 'Текущая страница пагинации' })
  page: number;

  @ApiProperty({ example: 10, description: 'Количество записей на одной странице' })
  perPage: number;

  @ApiProperty({ example: 100, description: 'Общее количество записей' })
  total: number;

  @ApiProperty({ example: 10, description: 'Общее количество страниц' })
  pageCount: number;
}
