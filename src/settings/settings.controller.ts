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

@ApiTags('Настройки игр')
@ApiSecurity('apiKey')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Получение записи настроек' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки найдены и возвращены',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для запроса настроек',
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async getSettings(
    @Query('appId') appId: string,
    @Query('gameId') gameId: string,
  ) {
    return this.settingsService.findSettings({ appId, gameId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение записи настроек' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки найдены и возвращены',
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
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания настроек',
  })
  @ApiConflictResponse({
    description: 'Настроек с таким сочетанием игры и приложения уже существуют',
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
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения настроек',
  })
  @ApiNotFoundResponse({
    description: 'Настроек с таким ID не существует',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создание записи настроек' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно созданы',
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
