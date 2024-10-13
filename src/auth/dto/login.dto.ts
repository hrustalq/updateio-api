import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Логин пользователя',
    example: 'username',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'StrongP@ssworD!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
