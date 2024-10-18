import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LoginWithCodeDto {
  @ApiProperty({
    description: 'Код для авторизации',
    example: 'd067dddc-b645-4154-b571-c22a9dcf26af',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  code: string;
}
