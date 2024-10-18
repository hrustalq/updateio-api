import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CreateUpdateRequestDto } from './dto/create-update-request.dto';
import { User } from '../users/entities/user.entity';
import { UpdateRequest } from './entities/update-request.entity';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/utils/paginated';
import { UpdateRequestStatus } from '@prisma/client';

@Injectable()
export class UpdatesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async createUpdateRequest(
    createUpdateRequestDto: CreateUpdateRequestDto,
    userId: string,
  ): Promise<UpdateRequest> {
    const { gameId, appId } = createUpdateRequestDto;

    const updateRequest = await this.prismaService.updateRequest.create({
      data: {
        gameId,
        appId,
        userId,
        status: 'PENDING',
      },
    });

    const updateCommand = await this.prismaService.settings.findUnique({
      where: {
        gameId_appId: {
          appId,
          gameId,
        },
      },
    });

    await this.publishUpdateRequest(updateRequest, updateCommand.updateCommand);

    return updateRequest as UpdateRequest;
  }

  private async publishUpdateRequest(
    updateRequest: UpdateRequest,
    updateCommand: string,
  ) {
    await this.amqpConnection.publish('updates', 'update.requested', {
      id: updateRequest.id,
      gameId: updateRequest.gameId,
      appId: updateRequest.appId,
      userId: updateRequest.userId,
      updateCommand,
    });
  }

  @RabbitSubscribe({
    exchange: 'updates',
    routingKey: 'update.completed',
    queue: 'update_completed_queue',
  })
  async handleUpdateCompleted(msg: { id: string }) {
    const { id } = msg;
    await this.prismaService.updateRequest.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  async getUpdateRequest(id: string, user: User): Promise<UpdateRequest> {
    const updateRequest = await this.prismaService.updateRequest.findUnique({
      where: { id },
    });

    if (!updateRequest) {
      throw new NotFoundException('Запрос на обновление не найден');
    }

    if (updateRequest.userId !== user.id) {
      throw new ForbiddenException(
        'У вас нет доступа к этому запросу на обновление',
      );
    }

    return updateRequest as UpdateRequest;
  }

  async deleteUpdateRequest(id: string, user: User): Promise<void> {
    const updateRequest = await this.getUpdateRequest(id, user);

    await this.prismaService.updateRequest.delete({
      where: { id: updateRequest.id },
    });
  }

  async getUpdateRequests(
    paginationParams: PaginationParamsDto,
    user: User,
  ): Promise<PaginatedResult<UpdateRequest>> {
    const { page, limit } = paginationParams;
    const skip = (page - 1) * limit;

    const [updateRequests, total] = await Promise.all([
      this.prismaService.updateRequest.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.updateRequest.count({
        where: { userId: user.id },
      }),
    ]);

    return new PaginatedResult(updateRequests, page, limit, total);
  }

  @RabbitSubscribe({
    exchange: 'updates',
    routingKey: 'update.requested',
    queue: 'update_requested_queue',
  })
  async handleUpdateRequested(msg: {
    id: string;
    gameId: string;
    appId: string;
    userId: string;
    externalId?: string;
    source: 'API' | 'IPC';
    updateCommand: string;
  }) {
    const { id, gameId, appId, userId, externalId, source, updateCommand } =
      msg;

    let updateRequest: UpdateRequest;

    if (source === 'IPC') {
      // Обработка локального обновления
      updateRequest = await this.handleLocalUpdate(id, gameId, appId, userId);
    } else {
      // Обработка внешнего обновления
      updateRequest = await this.prismaService.updateRequest.create({
        data: {
          id,
          gameId,
          appId,
          userId,
          status: 'PENDING',
          source: 'API',
        },
      });
    }

    // Публикация статуса обновления
    await this.publishUpdateStatus(updateRequest);
  }

  private async handleLocalUpdate(
    id: string,
    gameId: string,
    appId: string,
    userId: string,
  ): Promise<UpdateRequest> {
    const existingRequest = await this.prismaService.updateRequest.findUnique({
      where: { id },
    });

    if (existingRequest) {
      return existingRequest;
    }

    const updateRequest = await this.prismaService.updateRequest.create({
      data: {
        id,
        gameId,
        appId,
        userId,
        status: 'PROCESSING',
        source: 'IPC',
      },
    });

    // Здесь можно добавить логику для выполнения обновления
    // Например, вызов метода для выполнения команды обновления

    // Обновление статуса после выполнения обновления
    const updatedRequest = await this.prismaService.updateRequest.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    return updatedRequest;
  }

  private async publishUpdateStatus(updateRequest: UpdateRequest) {
    await this.amqpConnection.publish('updates', 'update.status', {
      id: updateRequest.id,
      gameId: updateRequest.gameId,
      appId: updateRequest.appId,
      userId: updateRequest.userId,
      status: updateRequest.status,
    });
  }

  @RabbitSubscribe({
    exchange: 'updates',
    routingKey: 'update.status',
    queue: 'update_status_queue',
  })
  async handleUpdateStatus(msg: { id: string; status: UpdateRequestStatus }) {
    const { id, status } = msg;
    await this.prismaService.updateRequest.update({
      where: { id },
      data: { status },
    });
  }
}
