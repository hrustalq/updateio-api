import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class GenerateQRCodeResponseDto {
  @ApiProperty({ description: 'Код для авторизации', type: 'string' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Дата истечения действительности кода', type: 'string' })
  expiresAt: Date;
}