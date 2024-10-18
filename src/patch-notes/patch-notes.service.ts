import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatchNoteDto } from './dto/create-patch-note.dto';
import { UpdatePatchNoteDto } from './dto/update-patch-note.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/utils/paginated';
import { PatchNote } from '@prisma/client';
import { HttpClientService } from '../http-client/http-client.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AppsService } from 'src/apps/apps.service';
import { GamesService } from 'src/games/games.service';
import { PatchNoteFilterDto } from './dto/patch-note-filter.dto';

@Injectable()
export class PatchNotesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpClientService: HttpClientService,
    private readonly appsService: AppsService,
    private readonly gamesService: GamesService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async create(createPatchNoteDto: CreatePatchNoteDto) {
    const patchNote = await this.prismaService.patchNote.create({
      data: createPatchNoteDto,
    });

    await this.publishPatchNote(patchNote);
    await this.notifySubscribedUsers(patchNote.id);

    return patchNote;
  }

  async findAll(pagination: PaginationParamsDto, filter: PatchNoteFilterDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    try {
      const where = {
        gameId: filter.gameId,
        appId: filter.appId,
      };

      // Удаляем undefined значения из объекта where
      Object.keys(where).forEach(
        (key) => where[key] === undefined && delete where[key],
      );

      const result = await this.prismaService.patchNote.findMany({
        where,
        take: pagination.limit,
        skip,
        include: { game: true, app: true },
      });
      const count = await this.prismaService.patchNote.count({ where });
      return new PaginatedResult<PatchNote>(
        result,
        pagination.page,
        pagination.limit,
        count,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    const patchNote = await this.prismaService.patchNote.findUnique({
      where: { id },
      include: { game: true, app: true },
    });
    if (!patchNote) {
      throw new NotFoundException('Патч-нот с указанным ID не найден');
    }
    return patchNote;
  }

  async update(id: string, updatePatchNoteDto: UpdatePatchNoteDto) {
    await this.findOne(id);
    return this.prismaService.patchNote.update({
      where: { id },
      data: updatePatchNoteDto,
      include: { game: true, app: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prismaService.patchNote.delete({
      where: { id },
    });
  }

  async notifySubscribedUsers(patchNoteId: string) {
    try {
      const patchNote = await this.prismaService.patchNote.findUnique({
        where: { id: patchNoteId },
        include: {
          game: true,
          app: true,
        },
      });

      if (!patchNote) {
        throw new NotFoundException('Патч-нот не найден');
      }

      const subscribedUsers =
        await this.prismaService.userGameSubscription.findMany({
          where: {
            gameId: patchNote.gameId,
            appId: patchNote.appId,
            isSubscribed: true,
          },
          select: {
            userId: true,
          },
        });

      const recipients = subscribedUsers.map((sub) => sub.userId);

      await this.publishNotification({
        app: {
          id: patchNote.app.id,
          name: patchNote.app.name,
        },
        game: {
          id: patchNote.game.id,
          name: patchNote.game.name,
        },
        recipients,
        patchNoteId: patchNote.id,
      });
    } catch (error) {
      console.error('Error notifying subscribed users:', error);
      throw new InternalServerErrorException('Ошибка при отправке уведомлений');
    }
  }

  private async publishNotification(data: {
    app: { id: string; name: string };
    game: { id: string; name: string };
    recipients: string[];
    patchNoteId: string;
  }) {
    try {
      await this.amqpConnection.publish(
        'notifications',
        'patch-note.notification',
        {
          app: data.app,
          game: data.game,
          recipients: data.recipients,
          patchNoteId: data.patchNoteId,
        },
      );
    } catch (error) {
      console.error('Error publishing notification to RabbitMQ:', error);
      throw new InternalServerErrorException('Failed to publish notification');
    }
  }

  private async publishPatchNote(patchNote: PatchNote) {
    const app = await this.appsService.findOne(patchNote.appId);
    const game = await this.gamesService.findOne(patchNote.gameId);
    try {
      await this.amqpConnection.publish('patch-notes', 'patch-note.created', {
        id: patchNote.id,
        title: patchNote.title,
        content: patchNote.content,
        version: patchNote.version,
        releaseDate: patchNote.releaseDate,
        app: {
          id: app.id,
          name: app.name,
        },
        game: {
          id: game.id,
          name: game.name,
        },
      });
    } catch (error) {
      console.error('Error publishing patch note to RabbitMQ:', error);
      throw new InternalServerErrorException('Failed to publish patch note');
    }
  }
}
