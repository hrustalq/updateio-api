import { ApiProperty } from '@nestjs/swagger';
import { App } from '../../apps/entities/app.entity';

export class GameResponseDto {
  @ApiProperty({ description: 'ID игры' })
  id: string;

  @ApiProperty({ description: 'Название игры' })
  name: string;

  @ApiProperty({ description: 'URL изображения игры' })
  image: string;

  @ApiProperty({ description: 'Версия игры' })
  version: string | number;

  @ApiProperty({
    type: [App],
    description: 'Список приложений, связанных с игрой',
  })
  apps: App[];
}
