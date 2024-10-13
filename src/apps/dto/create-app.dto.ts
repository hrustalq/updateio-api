import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAppDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Image file for the app',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;
}
