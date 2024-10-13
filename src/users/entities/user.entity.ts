import { User as UserModel, UserRole, Game } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Game as GameEntity } from 'src/games/entities/game.entity';

export class User implements Partial<UserModel> {
  @ApiProperty({ description: 'ID Пользователя', example: '123456' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Логин пользователя', example: 'username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'Является ли пользователь ботом',
    example: 'true',
  })
  @IsOptional()
  @IsBoolean()
  is_bot?: boolean;

  @ApiProperty({ description: 'Хеш пароля пользователя' })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  passwordHash: string;

  @ApiProperty({ description: 'Роль пользователя', example: 'GUEST' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'API Ключ пользователя', example: '' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  apiKey: string;

  @ApiProperty({ description: 'Подписки пользователя' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GameEntity)
  subscriptions: Game[];
}
