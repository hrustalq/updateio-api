import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Res,
} from '@nestjs/common';
import fs from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Сервисные данные приложения')
@ApiSecurity('apiKey')
@Controller('app')
export class AppController {
  constructor() {}

  @Get('swagger.json')
  @Public()
  @ApiOperation({ summary: 'Получение json файла схемы апи' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => File,
    description: 'Файл схемы успешно получен',
  })
  @ApiNotFoundResponse({
    description: 'Файл схемы не найден',
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async getSwaggerJson(@Res() res: Response) {
    const filePath = join(process.cwd(), 'swagger.json');
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Файл схемы не найден');
    }
    return res.sendFile(filePath);
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Проверка работоспособности API' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API работает нормально',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'API is up and running' },
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      message: 'API is up and running',
    };
  }
}
