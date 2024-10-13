import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationQuery,
  PaginatedRequest,
} from '../common/decorators/paginated.decorator';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Пользователи')
@ApiSecurity('apiKey')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно создан',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания пользователя',
  })
  @ApiConflictResponse({
    description: 'Пользователь с такой почтой уже существует',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получение списка пользователей' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Количество элементов на странице',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пользователи найдены' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра списка пользователей',
  })
  @ApiNotFoundResponse({ description: 'Пользователи не найдены' })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @PaginatedRequest()
  findAll(@PaginationQuery() pagination: PaginationParamsDto) {
    return this.usersService.findAll(pagination);
  }

  @Get('me')
  @ApiOperation({ summary: 'Получение информации о текущем пользователе' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Информация о пользователе получена',
  })
  @ApiForbiddenResponse({ description: 'Пользователь не авторизован' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  getCurrentUser(@CurrentUser() user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, createdAt, updatedAt, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пользователь найден' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра информации о пользователе',
  })
  @ApiNotFoundResponse({ description: 'Пользователь с таким ID не существует' })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновление данных пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные пользователя успешно обновлены',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения данных пользователя',
  })
  @ApiNotFoundResponse({ description: 'Пользователь с таким ID не существует' })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь успешно удален',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления пользователя',
  })
  @ApiNotFoundResponse({ description: 'Пользователь с таким ID не существует' })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
