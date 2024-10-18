import { User as UserModel, UserRole, Game } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Game as GameEntity } from 'src/games/entities/game.entity';

export class User implements Partial<UserModel> {
  @ApiProperty({
    description: 'ID Пользователя',
    example: '12345678',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Логин пользователя',
    example: 'username',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    type: 'string',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  lastName?: string | null;

  @ApiProperty({
    description: 'Язык пользователя',
    example: 'ru',
    type: 'string',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  languageCode?: string | null;

  @ApiProperty({
    description: 'Является ли пользователь ботом',
    example: 'true',
    nullable: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isBot?: boolean | null;

  @ApiProperty({
    description: 'Является ли пользователь ботом',
    example: 'true',
    nullable: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  allowsWriteToPm?: boolean;

  @ApiProperty({
    description: 'Является ли пользователь ботом',
    example: 'true',
    nullable: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  addedToAttachMenu?: boolean | null;

  @ApiProperty({
    description: 'Роль пользователя',
    example: 'GUEST',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'API Ключ пользователя',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  apiKey: string;

  @ApiProperty({
    description: 'Подписки пользователя',
    type: GameEntity,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GameEntity)
  subscriptions: Game[];
}
