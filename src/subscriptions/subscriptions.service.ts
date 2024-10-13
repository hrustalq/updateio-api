import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/utils/paginated';
import { User, UserRole } from '@prisma/client';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { GameResponseDto } from './dto/game-response.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async getGames(
    pagination: PaginationParamsDto,
    appId?: string,
  ): Promise<PaginatedResult<GameResponseDto>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const whereClause = appId
      ? {
          appsWithGame: {
            some: {
              appId: appId,
            },
          },
        }
      : {};

    const [games, totalCount] = await Promise.all([
      this.prismaService.game.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
      this.prismaService.game.count({
        where: whereClause,
      }),
    ]);

    return new PaginatedResult<GameResponseDto>(games, page, limit, totalCount);
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    user: User,
  ): Promise<SubscriptionResponseDto> {
    const { gameId, appId, isSubscribed } = createSubscriptionDto;

    // Проверяем существование игры и приложения
    const [game, app] = await Promise.all([
      this.prismaService.game.findUnique({ where: { id: gameId } }),
      this.prismaService.app.findUnique({ where: { id: appId } }),
    ]);

    if (!game || !app) {
      throw new BadRequestException('Неверный ID игры или приложения');
    }

    // Проверяем, существует ли уже подписка для этого пользователя, игры и приложения
    const existingSubscription =
      await this.prismaService.userGameSubscription.findUnique({
        where: {
          userId_gameId_appId: {
            userId: user.id,
            gameId,
            appId,
          },
        },
      });

    if (existingSubscription) {
      throw new ConflictException(
        'Подписка на эту игру и приложение уже существует',
      );
    }

    try {
      const subscription = await this.prismaService.userGameSubscription.create(
        {
          data: {
            user: { connect: { id: user.id } },
            game: { connect: { id: gameId } },
            app: { connect: { id: appId } },
            isSubscribed: isSubscribed,
          },
          include: {
            game: true,
            app: true,
          },
        },
      );

      await this.publishSubscriptionCreated({
        userId: user.id,
        gameId: subscription.gameId,
        gameName: subscription.game.name,
        appId: subscription.appId,
        appName: subscription.app.name,
        isSubscribed: subscription.isSubscribed,
      });

      const responseDto: SubscriptionResponseDto = {
        id: subscription.id,
        isSubscribed: subscription.isSubscribed,
        app: {
          id: subscription.app.id,
          name: subscription.app.name,
          image: subscription.app.image,
        },
        game: {
          id: subscription.game.id,
          name: subscription.game.name,
          image: subscription.game.image,
        },
      };

      return responseDto;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Ошибка при создании подписки');
    }
  }

  async findAll(
    pagination: PaginationParamsDto,
    user: User,
  ): Promise<PaginatedResult<SubscriptionResponseDto>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [subscriptions, totalCount] = await Promise.all([
      this.prismaService.userGameSubscription.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          app: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      this.prismaService.userGameSubscription.count({
        where: { userId: user.id },
      }),
    ]);

    const formattedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      isSubscribed: sub.isSubscribed,
      game: sub.game,
      app: sub.app,
    }));

    return new PaginatedResult<SubscriptionResponseDto>(
      formattedSubscriptions,
      page,
      limit,
      totalCount,
    );
  }

  async findOne(gameId: string, appId: string, user: User) {
    const subscription =
      await this.prismaService.userGameSubscription.findUnique({
        where: {
          userId_gameId_appId: {
            userId: user.id,
            gameId: gameId,
            appId: appId,
          },
        },
        include: {
          game: true,
          app: true,
        },
      });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    return subscription;
  }

  async update(
    id: string,
    user: User,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    await this.checkUserPermission(id, user);

    try {
      const updatedSubscription =
        await this.prismaService.userGameSubscription.update({
          where: {
            id: id,
          },
          data: {
            isSubscribed: updateSubscriptionDto.isSubscribed,
          },
          include: {
            game: true,
            app: true,
          },
        });

      await this.publishSubscriptionUpdated({
        userId: user.id,
        gameId: updatedSubscription.gameId,
        gameName: updatedSubscription.game.name,
        appId: updatedSubscription.appId,
        appName: updatedSubscription.app.name,
        isSubscribed: updatedSubscription.isSubscribed,
      });

      return updatedSubscription;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Ошибка при обновлении подписки');
    }
  }

  async remove(id: string, user: User) {
    await this.checkUserPermission(id, user);

    try {
      const removedSubscription =
        await this.prismaService.userGameSubscription.delete({
          where: {
            id: id,
          },
          include: {
            game: true,
            app: true,
          },
        });

      await this.publishSubscriptionRemoved({
        userId: user.id,
        gameId: removedSubscription.gameId,
        gameName: removedSubscription.game.name,
        appId: removedSubscription.appId,
        appName: removedSubscription.app.name,
      });

      return removedSubscription;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Ошибка при удалении подписки');
    }
  }

  async checkUserPermission(subscriptionId: string, user: User) {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const subscription =
      await this.prismaService.userGameSubscription.findUnique({
        where: {
          id: subscriptionId,
        },
      });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    if (subscription.userId !== user.id) {
      throw new ForbiddenException(
        'У вас нет прав на управление этой подпиской',
      );
    }

    return true;
  }

  private async publishSubscriptionCreated(data: {
    userId: string;
    gameId: string;
    gameName: string;
    appId: string;
    appName: string;
    isSubscribed: boolean;
  }) {
    try {
      await this.amqpConnection.publish(
        'subscriptions',
        'subscription.created',
        {
          userId: data.userId,
          game: {
            id: data.gameId,
            name: data.gameName,
          },
          app: {
            id: data.appId,
            name: data.appName,
          },
          isSubscribed: data.isSubscribed,
        },
      );
    } catch (error) {
      console.error(
        'Error publishing subscription created event to RabbitMQ:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to publish subscription created event',
      );
    }
  }

  private async publishSubscriptionRemoved(data: {
    userId: string;
    gameId: string;
    gameName: string;
    appId: string;
    appName: string;
  }) {
    try {
      await this.amqpConnection.publish(
        'subscriptions',
        'subscription.removed',
        {
          userId: data.userId,
          game: {
            id: data.gameId,
            name: data.gameName,
          },
          app: {
            id: data.appId,
            name: data.appName,
          },
        },
      );
    } catch (error) {
      console.error(
        'Error publishing subscription removed event to RabbitMQ:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to publish subscription removed event',
      );
    }
  }

  private async publishSubscriptionUpdated(data: {
    userId: string;
    gameId: string;
    gameName: string;
    appId: string;
    appName: string;
    isSubscribed: boolean;
  }) {
    try {
      await this.amqpConnection.publish(
        'subscriptions',
        'subscription.updated',
        {
          userId: data.userId,
          game: {
            id: data.gameId,
            name: data.gameName,
          },
          app: {
            id: data.appId,
            name: data.appName,
          },
          isSubscribed: data.isSubscribed,
        },
      );
    } catch (error) {
      console.error(
        'Error publishing subscription updated event to RabbitMQ:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to publish subscription updated event',
      );
    }
  }
}
