import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUpdateRequestDto {
  @ApiProperty({ description: 'ID игры', type: String })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'ID приложения', type: String })
  @IsString()
  @IsNotEmpty()
  appId: string;
}

export class CreateUpdateRequestWithSystemDto {
  @ApiProperty({ description: 'ID игры', type: String })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'ID приложения', type: String })
  @IsString()
  @IsNotEmpty()
  appId: string;

  @ApiProperty({ description: 'ID пользователя', type: String })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
