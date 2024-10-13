import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationParamsDto } from '../../common/dto/pagination.dto';

export class FindGamesDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ID приложения для фильтрации игр' })
  appId?: string;
}
