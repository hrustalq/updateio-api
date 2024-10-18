import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
  ApiSecurity,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdatesService } from './updates.service';
import {
  CreateUpdateRequestDto,
  CreateUpdateRequestWithSystemDto,
} from './dto/create-update-request.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiGlobalErrorResponses } from '../common/decorators/error-response.decorator';
import { ForbiddenResponseDto } from 'src/common/dto/error-response.dto';
import { UpdateRequest } from './entities/update-request.entity';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { GetUpdateRequestsResponseDto } from './dto/get-update-requests.dto';
import {
  PaginatedRequest,
  PaginationQuery,
} from 'src/common/decorators/paginated.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Обновления')
@ApiSecurity('apiKey')
@ApiGlobalErrorResponses()
@Controller('updates')
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) {}

  @Post('request')
  @ApiOperation({ summary: 'Запрос на обновление' })
  @ApiResponse({
    status: 201,
    description: 'Запрос на обновление успешно создан',
    type: UpdateRequest,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания запроса на обновление',
    type: ForbiddenResponseDto,
  })
  async requestUpdate(
    @Body() createUpdateRequestDto: CreateUpdateRequestDto,
    @CurrentUser() user: User,
  ): Promise<UpdateRequest> {
    return this.updatesService.createUpdateRequest(
      createUpdateRequestDto,
      user.id,
    );
  }

  @Post('request_system')
  @ApiOperation({ summary: 'Запрос на обновление' })
  @ApiResponse({
    status: 201,
    description: 'Запрос на обновление успешно создан',
    type: UpdateRequest,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания запроса на обновление',
    type: ForbiddenResponseDto,
  })
  @Roles('ADMIN')
  async requestUpdateSystem(
    @Body() createUpdateRequestDto: CreateUpdateRequestWithSystemDto,
  ): Promise<UpdateRequest> {
    return this.updatesService.createUpdateRequest(
      createUpdateRequestDto,
      createUpdateRequestDto.userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить запрос на обновление по ID' })
  @ApiParam({ name: 'id', description: 'ID запроса на обновление' })
  @ApiResponse({
    status: 200,
    description: 'Запрос на обновление успешно получен',
    type: UpdateRequest,
  })
  async getUpdateRequest(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<UpdateRequest> {
    return this.updatesService.getUpdateRequest(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить запрос на обновление' })
  @ApiParam({ name: 'id', description: 'ID запроса на обновление' })
  @ApiResponse({
    status: 200,
    description: 'Запрос на обновление успешно удален',
  })
  async deleteUpdateRequest(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.updatesService.deleteUpdateRequest(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список запросов на обновление' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Список запросов на обновление успешно получен',
    type: GetUpdateRequestsResponseDto,
  })
  @PaginatedRequest()
  async getUpdateRequests(
    @PaginationQuery() pagination: PaginationParamsDto,
    @CurrentUser() user: User,
  ) {
    return this.updatesService.getUpdateRequests(pagination, user);
  }
}
