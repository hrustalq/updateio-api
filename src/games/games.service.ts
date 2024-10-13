import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/utils/paginated';
import { Game } from '@prisma/client';
import { FindGamesDto } from './dto/find-games.dto';
import { S3Service } from '../s3/s3.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GamesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createGameDto: CreateGameDto, image?: Express.Multer.File) {
    let imageUrl: string | undefined;

    if (image) {
      const key = `games/${Date.now()}-${image.originalname}`;
      imageUrl = await this.s3Service.uploadFile(image, key);
    }

    const { appIds, ...payload } = createGameDto;

    return this.prismaService.game.create({
      data: {
        ...payload,
        appsWithGame: {
          create: appIds.map((appId) => ({
            app: {
              connect: { id: appId },
            },
          })),
        },
        image: imageUrl,
      },
      include: {
        appsWithGame: {
          include: {
            app: true,
          },
        },
      },
    });
  }

  async findAll(findGamesDto: FindGamesDto) {
    const { page, limit, appId } = findGamesDto;
    const skip = (page - 1) * limit;
    try {
      const [result, count] = await Promise.all([
        this.prismaService.game.findMany({
          where: {
            appsWithGame: {
              some: {
                appId: appId,
              },
            },
          },
          take: limit,
          skip,
        }),
        this.prismaService.game.count({
          where: {
            appsWithGame: {
              some: {
                appId: appId,
              },
            },
          },
        }),
      ]);
      return new PaginatedResult<Game>(result, page, limit, count);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    const cachedGame: Game = await this.cacheManager.get(`games_${id}`);
    if (cachedGame) return cachedGame;
    const game = await this.prismaService.game.findUnique({
      where: { id },
      include: {
        appsWithGame: {
          include: {
            app: true,
          },
        },
      },
    });
    if (!game) {
      throw new NotFoundException('Игра с указанным ID не найдена');
    }
    this.cacheManager.set(`games_${id}`, game);
    return game;
  }

  async update(
    id: string,
    updateGameDto: UpdateGameDto,
    image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (image) {
      const key = `games/${Date.now()}-${image.originalname}`;
      imageUrl = await this.s3Service.uploadFile(image, key);
    }

    const { appIds, ...payload } = updateGameDto;

    await this.findOne(id);
    return this.prismaService.game.update({
      where: { id },
      data: {
        ...payload,
        ...(imageUrl && { image: imageUrl }),
        ...(appIds && {
          appsWithGame: {
            deleteMany: {},
            create: appIds.map((appId) => ({
              app: {
                connect: { id: appId },
              },
            })),
          },
        }),
      },
      include: {
        appsWithGame: {
          include: {
            app: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prismaService.game.delete({
      where: { id },
    });
  }

  async searchByName(name: string, pagination: PaginationParamsDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    try {
      const [games, totalCount] = await Promise.all([
        this.prismaService.game.findMany({
          where: {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
          include: {
            appsWithGame: {
              include: {
                app: true,
              },
            },
          },
          take: pagination.limit,
          skip,
        }),
        this.prismaService.game.count({
          where: {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        }),
      ]);

      if (games.length === 0) {
        throw new NotFoundException('Игры с указанным названием не найдены');
      }

      return new PaginatedResult<Game>(
        games,
        pagination.page,
        pagination.limit,
        totalCount,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Ошибка при поиске игр');
    }
  }
}
