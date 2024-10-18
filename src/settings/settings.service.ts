import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/utils/paginated';
import { Settings, Prisma } from '@prisma/client';
import { AppsService } from 'src/apps/apps.service';
import { GamesService } from 'src/games/games.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly appsService: AppsService,
    private readonly gamesService: GamesService,
  ) {}

  async findSettings(
    pagination: PaginationParamsDto,
    { appId, gameId }: { appId?: string; gameId?: string },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    try {
      const whereClause: Prisma.SettingsWhereInput = {
        ...(appId && { appId }),
        ...(gameId && { gameId }),
      };

      const [result, count] = await Promise.all([
        this.prismaService.settings.findMany({
          where: whereClause,
          take: limit,
          skip,
        }),
        this.prismaService.settings.count({
          where: whereClause,
        }),
      ]);

      if (result.length === 0 && (appId || gameId)) {
        throw new NotFoundException(
          'Настройки с указанными параметрами не найдены',
        );
      }

      return new PaginatedResult<Settings>(result, page, limit, count);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Ошибка при поиске настроек');
    }
  }

  async findSettingsById(id: string) {
    const find = await this.prismaService.settings.findUnique({
      where: { id },
    });
    if (!find) throw new NotFoundException('Настроек с таким ID не существует');
    return find;
  }

  async createSettings(dto: CreateSettingsDto) {
    const find = await this.prismaService.settings.findUnique({
      where: {
        gameId_appId: {
          gameId: dto.gameId,
          appId: dto.appId,
        },
      },
    });
    if (find) {
      throw new ConflictException(
        'Настройки для этой игры и приложения уже существуют!',
      );
    }
    await this.appsService.findOne(dto.appId);
    await this.gamesService.findOne(dto.gameId);

    return this.prismaService.settings.create({
      data: {
        app: {
          connect: {
            id: dto.appId,
          },
        },
        game: {
          connect: {
            id: dto.gameId,
          },
        },
        executorName: dto.executorName,
        updateCommand: dto.updateCommand,
      },
    });
  }

  async updateSettings(id: string, dto: UpdateSettingsDto) {
    const find = await this.prismaService.settings.findUnique({
      where: {
        id: id,
      },
    });
    if (!find) throw new NotFoundException('Записи настроек не существует');
    return this.prismaService.settings.update({
      where: {
        id,
      },
      data: {
        ...find,
        ...dto,
      },
    });
  }

  async deleteSettings(id: string) {
    const find = await this.prismaService.settings.findUnique({
      where: {
        id,
      },
    });
    if (!find) throw new NotFoundException('Настроек с таким ID не существует');
    return this.prismaService.settings.delete({ where: { id } });
  }
}
