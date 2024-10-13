import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Inject,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginationQuery,
  PaginatedRequest,
} from '../common/decorators/paginated.decorator';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UserCacheKey } from '../common/decorators/user-cache-key.decorator';
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor';
import { CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginatedResult } from '../common/utils/paginated';
import { GameResponseDto } from './dto/game-response.dto';

@ApiTags('Подписки')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('games')
  @ApiOperation({ summary: 'Получение списка игр для подписки' })
  @ApiQuery({ name: 'appId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Список игр получен',
    type: PaginatedResult<GameResponseDto>,
  })
  @PaginatedRequest()
  async getGames(
    @PaginationQuery() pagination: PaginationParamsDto,
    @Query('appId') appId?: string,
  ): Promise<PaginatedResult<GameResponseDto>> {
    return this.subscriptionsService.getGames(pagination, appId);
  }

  @Post()
  @ApiOperation({ summary: 'Создание новой подписки' })
  @ApiSecurity('apiKey')
  @ApiResponse({
    status: 201,
    description: 'Подписка успешно создана',
    type: SubscriptionResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания подписки',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при создании подписки',
  })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @CurrentUser() user: User,
  ): Promise<SubscriptionResponseDto> {
    const result = await this.subscriptionsService.create(
      createSubscriptionDto,
      user,
    );
    await this.cacheManager.del(`user_subscriptions_${user.id}`);
    return result;
  }

  @Get()
  @UseInterceptors(UserCacheInterceptor)
  @UserCacheKey('user_subscriptions')
  @CacheTTL(10)
  @ApiOperation({ summary: 'Получение списка подписок пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список подписок получен',
    type: PaginatedResult<SubscriptionResponseDto>,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра подписок',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении подписок',
  })
  @PaginatedRequest()
  findAll(
    @PaginationQuery() pagination: PaginationParamsDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<SubscriptionResponseDto>> {
    return this.subscriptionsService.findAll(pagination, user);
  }

  @Get(':gameId/:appId')
  @UseInterceptors(UserCacheInterceptor)
  @UserCacheKey('user_subscription')
  @ApiOperation({ summary: 'Получение подписки по ID игры и ID приложения' })
  @ApiResponse({ status: 200, description: 'Подписка найдена' })
  @ApiNotFoundResponse({ description: 'Подписка не найдена' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра информации о подписке',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении подписки',
  })
  findOne(
    @Param('gameId') gameId: string,
    @Param('appId') appId: string,
    @CurrentUser() user: User,
  ) {
    return this.subscriptionsService.findOne(gameId, appId, user);
  }

  @Patch(':id')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Обновление данных подписки' })
  @ApiResponse({
    status: 200,
    description: 'Данные подписки успешно обновлены',
  })
  @ApiNotFoundResponse({ description: 'Подписка не найдена' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения данных подписки',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при обновлении подписки',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.subscriptionsService.update(
      id,
      user,
      updateSubscriptionDto,
    );
    await this.cacheManager.del(`user_subscriptions_${user.id}`);
    await this.cacheManager.del(`user_subscription_${user.id}_${id}`);
    return result;
  }

  @Delete(':id')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Удаление подписки' })
  @ApiResponse({ status: 200, description: 'Подписка успешно удалена' })
  @ApiNotFoundResponse({ description: 'Подписка не найдена' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления подписки',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при удалении подписки',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.subscriptionsService.remove(id, user);
    await this.cacheManager.del(`user_subscriptions_${user.id}`);
    return result;
  }
}
