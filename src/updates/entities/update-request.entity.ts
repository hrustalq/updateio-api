import { ApiProperty } from '@nestjs/swagger';
import { UpdateRequestStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateRequest {
  @ApiProperty({
    description: 'Уникальный идентификатор запроса на обновление',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Статус запроса на обновление',
    enum: UpdateRequestStatus,
  })
  @IsEnum(UpdateRequestStatus)
  @IsNotEmpty()
  status: UpdateRequestStatus;

  @ApiProperty({ description: 'ID игры' })
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'ID приложения' })
  @IsString()
  @IsNotEmpty()
  appId: string;

  @ApiProperty({ description: 'ID пользователя, создавшего запрос' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Дата и время создания запроса' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата и время последнего обновления запроса' })
  updatedAt: Date;
}
