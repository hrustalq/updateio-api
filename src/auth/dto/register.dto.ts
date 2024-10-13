import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: '6234567890',
    description: 'ID пользователя в Telegram',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example: 'John',
    description: 'Имя пользователя',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия пользователя',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    example: 'username',
    description: 'Имя пользователя в Telegram',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя (необязательно)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    example: 'en',
    description: 'Языковые настройки пользователя',
  })
  @IsOptional()
  @IsString()
  language_code?: string;

  @ApiProperty({
    example: 'true',
    description: 'Премиум пользователь',
  })
  @IsOptional()
  @IsBoolean()
  is_premium?: boolean;

  @ApiProperty({
    example: 'false',
    description: 'Является ли пользователь ботом',
  })
  @IsNotEmpty()
  @IsBoolean()
  is_bot: boolean;

  @ApiProperty({
    example: 'true',
    description: 'Добавлен в меню пользователя',
  })
  @IsOptional()
  @IsBoolean()
  added_to_attachment_menu?: boolean;

  @ApiProperty({
    example: 'admin',
    enum: UserRole,
    description: 'Роль пользователя',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
