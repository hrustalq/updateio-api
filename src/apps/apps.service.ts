import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/utils/paginated';
import { App, Prisma } from '@prisma/client';
import { S3Service } from '../s3/s3.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AppsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly s3Service: S3Service,
  ) {}

  async create(createAppDto: CreateAppDto, image?: Express.Multer.File) {
    let imageUrl: string | undefined;

    if (image) {
      const key = `apps/${Date.now()}-${image.originalname}`;
      imageUrl = await this.s3Service.uploadFile(image, key);
    }

    const app = await this.prismaService.app.create({
      data: {
        ...createAppDto,
        image: imageUrl,
      },
    });
    this.cacheManager.set(`apps_${app.id}`, app);
    this.clearPaginatedCache();
    return app;
  }

  async findAll(pagination: PaginationParamsDto, name?: string) {
    const skip = (pagination.page - 1) * pagination.limit;

    try {
      const where: Prisma.AppWhereInput = name
        ? { name: { contains: name, mode: Prisma.QueryMode.insensitive } }
        : {};

      const result = await this.prismaService.app.findMany({
        where,
        take: pagination.limit,
        skip,
      });

      const count = await this.prismaService.app.count({ where });

      const paginatedResult = new PaginatedResult<App>(
        result,
        pagination.page,
        pagination.limit,
        count,
      );

      return paginatedResult;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    const cachedGame: App = await this.cacheManager.get(`apps_${id}`);
    if (cachedGame) return cachedGame;
    const app = await this.prismaService.app.findUnique({
      where: { id },
    });
    if (!app) {
      throw new NotFoundException('Приложение с указанным ID не найдено');
    }
    this.cacheManager.set(`apps_${id}`, app);
    return app;
  }

  async update(
    id: string,
    updateAppDto: UpdateAppDto,
    image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (image) {
      const key = `apps/${Date.now()}-${image.originalname}`;
      imageUrl = await this.s3Service.uploadFile(image, key);
    }

    const newImage = await this.prismaService.app.update({
      where: { id },
      data: {
        ...updateAppDto,
        ...(imageUrl && { image: imageUrl }),
      },
    });
    this.cacheManager.set(`apps_${newImage.id}`, newImage);
    return newImage;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prismaService.app.delete({ where: { id } });
    await this.cacheManager.del(`apps_${id}`);

    // Clear paginated results cache when an app is deleted
    await this.clearPaginatedCache();

    return deleted;
  }

  private async clearPaginatedCache() {
    const keys = await this.cacheManager.store.keys();
    const paginatedKeys = keys.filter((key) => key.startsWith('apps_page_'));
    await Promise.all(paginatedKeys.map((key) => this.cacheManager.del(key)));
  }
}
