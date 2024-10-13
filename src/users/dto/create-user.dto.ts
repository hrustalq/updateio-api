import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto implements Partial<User> {
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
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия пользователя',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

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
  languageCode?: string;

  @ApiProperty({
    example: 'true',
    description: 'Премиум пользователь',
  })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiProperty({
    example: 'false',
    description: 'Является ли пользователь ботом',
  })
  @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  isBot?: boolean;

  @ApiProperty({
    example: 'true',
    description: 'Добавлен в меню пользователя',
  })
  @IsOptional()
  @IsBoolean()
  addedToAttachMenu?: boolean;

  @ApiProperty({
    example: 'true',
    description: 'Пользователь разрешает писать в личные сообщения',
  })
  @IsOptional()
  @IsBoolean()
  allowsWriteToPm?: boolean;

  @ApiProperty({
    example: 'admin',
    enum: UserRole,
    description: 'Роль пользователя',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
