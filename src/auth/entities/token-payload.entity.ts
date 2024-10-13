import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class TokenPayload {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  @ApiProperty({ description: 'Проль пользователя' })
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'ID пользователя' })
  jti: string;
}

export class TokenData {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Почта пользователя' })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  @ApiProperty({ description: 'Проль пользователя' })
  role: UserRole;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Дата создания токена' })
  iat: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Дата протухания токена' })
  exp: number;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'ID пользователя' })
  jti: string;
}
