import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';
import { Settings } from './entities/settings.entity';
import { GetSettingsResponseDto } from './dto/get-settings-response.dto';
import { ApiGlobalErrorResponses } from 'src/common/decorators/error-response.decorator';
import { PaginatedRequest, PaginationQuery } from 'src/common/decorators/paginated.decorator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@ApiTags('Настройки игр')
@ApiSecurity('apiKey')
@ApiGlobalErrorResponses()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Получение записи настроек' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки найдены и возвращены',
    type: GetSettingsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для запроса настроек',
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @PaginatedRequest()
  @ApiQuery({ name: 'appId', required: true, type: String })
  @ApiQuery({ name: 'gameId', required: true, type: String })
  async getSettings(
    @Query('appId') appId: string,
    @Query('gameId') gameId: string,
    @PaginationQuery() pagination: PaginationParamsDto
  ) {
    return this.settingsService.findSettings(pagination, { appId, gameId });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получение записи настроек по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки найдены и возвращены',
    type: Settings,
  })
  @ApiNotFoundResponse({
    description: 'Настроек с таким ID не существует',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для запроса настроек',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async getSettingsById(@Param('id') id: string) {
    return this.settingsService.findSettingsById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создание записи настроек' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Настройки успешно созданы',
    type: Settings,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания настроек',
  })
  @ApiConflictResponse({
    description: 'Настройки с таким сочетанием игры и приложения уже существуют',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async createSettings(@Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.createSettings(createSettingsDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Изменение записи настроек' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно изменены',
    type: Settings,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения настроек',
  })
  @ApiNotFoundResponse({
    description: 'Настроек с таким ID не существует',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(id, updateSettingsDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удаление записи настроек' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно удалены',
    type: Settings,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления настроек',
  })
  @ApiNotFoundResponse({
    description: 'Настроек с таким ID не существует',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async deleteSettings(@Param('id') id: string) {
    return this.settingsService.deleteSettings(id);
  }
}
