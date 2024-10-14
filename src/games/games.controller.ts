import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiSecurity,
  ApiBody
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  PaginationQuery,
  PaginatedRequest,
} from '../common/decorators/paginated.decorator';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { GetGamesResponseDto } from './dto/get-games-reponse.dto';
import { Game } from './entities/game.entity';
import { type File } from 'src/common/types/formdata-file';
import { ApiGlobalErrorResponses } from 'src/common/decorators/error-response.decorator';

@ApiTags('Игры')
@ApiGlobalErrorResponses()
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Создание новой игры' })
  @ApiResponse({ status: 201, description: 'Игра успешно создана' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания игры',
  })
  @ApiConflictResponse({
    description: 'Игра с таким названием уже существует для данного провайдера',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при создании игры',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: "Данные для создания игры", type: CreateGameDto })
  create(
    @Body() createGameDto: CreateGameDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.gamesService.create(createGameDto, image);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Получение списка игр или поиск игр по названию' })
  @ApiResponse({
    status: 200,
    description: 'Список игр получен',
    type: GetGamesResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра списка игр',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении списка игр',
  })
  @PaginatedRequest()
  @ApiQuery({
    name: 'appId',
    required: false,
    description: 'ID приложения для фильтрации игр',
  })
  @ApiQuery({
    name: 'appName',
    required: false,
    description: 'Название приложения для фильтрации игр',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Название игры для поиска',
  })
  findAll(
    @PaginationQuery() pagination: PaginationParamsDto,
    @Query('appId') appId?: string,
    @Query('appName') appName?: string,
    @Query('name') name?: string,
  ) {
    return this.gamesService.findAll(pagination, appId, appName, name);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получение игры по ID' })
  @ApiResponse({ status: 200, description: 'Игра найдена', type: Game })
  @ApiNotFoundResponse({ description: 'Игра с указанным ID не найдена' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра информации об игре',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении игры по ID',
  })
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Обновление данных игры' })
  @ApiResponse({ status: 200, description: 'Данные игры успешно обновлены' })
  @ApiNotFoundResponse({ description: 'Игра с указанным ID не найдена' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения данных игры',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при обновлении данных игры',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: "Данные для обновления игры", type: UpdateGameDto })
  update(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.gamesService.update(id, updateGameDto, image);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Удаление игры' })
  @ApiResponse({ status: 200, description: 'Игра успешно удалена' })
  @ApiNotFoundResponse({ description: 'Игра с указанным ID не найдена' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления игры',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при удалении игры',
  })
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
