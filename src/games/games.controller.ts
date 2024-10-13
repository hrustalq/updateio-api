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
import { FindGamesDto } from './dto/find-games.dto';
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
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  PaginationQuery,
  PaginatedRequest,
} from '../common/decorators/paginated.decorator';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Игры')
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
  create(
    @Body() createGameDto: CreateGameDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.gamesService.create(createGameDto, image);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка игр' })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
  })
  @ApiQuery({
    name: 'appId',
    required: false,
    description: 'ID приложения для фильтрации игр',
  })
  @ApiResponse({ status: 200, description: 'Список игр получен' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра списка игр',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении списка игр',
  })
  @Public()
  findAll(@Query() findGameDto: FindGamesDto) {
    return this.gamesService.findAll(findGameDto);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Поиск игры по названию' })
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'Название игры для поиска',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
  })
  @ApiResponse({ status: 200, description: 'Игры найдены' })
  @ApiNotFoundResponse({ description: 'Игры с указанным названием не найдены' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для поиска игр',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при поиске игр',
  })
  @PaginatedRequest()
  searchByName(
    @Query('name') name: string,
    @PaginationQuery() pagination: PaginationParamsDto,
  ) {
    return this.gamesService.searchByName(name, pagination);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получение игры по ID' })
  @ApiResponse({ status: 200, description: 'Игра найдена' })
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
