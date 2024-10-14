import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiBody,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginationQuery,
  PaginatedRequest,
} from '../common/decorators/paginated.decorator';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AppResponseDto } from './dto/app-response.dto';

@ApiTags('Приложения')
@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiSecurity('apiKey')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создание нового приложения' })
  @ApiResponse({ status: 201, description: 'Приложение успешно создано' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания приложения',
  })
  create(
    @Body() createAppDto: CreateAppDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.appsService.create(createAppDto, image);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Получение списка приложений' })
  @ApiResponse({
    status: 200,
    description: 'Список приложений получен',
    type: AppResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра списка приложений',
  })
  @PaginatedRequest()
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Фильтр по имени приложения',
  })
  findAll(
    @PaginationQuery() pagination: PaginationParamsDto,
    @Query('name') name?: string,
  ) {
    return this.appsService.findAll(pagination, name);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получение приложения по ID' })
  @ApiResponse({ status: 200, description: 'Приложение найдено' })
  @ApiNotFoundResponse({ description: 'Приложение с указанным ID не найдено' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра информации о приложении',
  })
  findOne(@Param('id') id: string) {
    return this.appsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiSecurity('apiKey')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновление данных приложения' })
  @ApiResponse({
    status: 200,
    description: 'Данные приложения успешно обновлены',
  })
  @ApiNotFoundResponse({ description: 'Приложение с указанным ID не найдено' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения данных приложения',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  update(
    @Param('id') id: string,
    @Body() updateAppDto: UpdateAppDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.appsService.update(id, updateAppDto, image);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Удаление приложения' })
  @ApiResponse({ status: 200, description: 'Приложение успешно удалено' })
  @ApiNotFoundResponse({ description: 'Приложение с указанным ID не найдено' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления приложения',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при удалении приложения',
  })
  remove(@Param('id') id: string) {
    return this.appsService.remove(id);
  }
}
