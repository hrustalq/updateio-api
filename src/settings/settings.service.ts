import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findSettings({ appId, gameId }: { appId: string; gameId: string }) {
    return this.prismaService.settings.findUnique({
      where: {
        gameId_appId: {
          gameId,
          appId,
        },
      },
    });
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
    if (find)
      throw new ConflictException(
        'Настройки для этой игры и приложения уже существуют!',
      );
    return this.prismaService.settings.create({
      data: dto,
    });
  }

  async updateSettings(dto: UpdateSettingsDto) {
    if (!dto.gameId || !dto.appId)
      throw new BadRequestException('Не указан id приложения и/или id игры');
    const find = await this.prismaService.settings.findUnique({
      where: {
        gameId_appId: {
          gameId: dto.gameId,
          appId: dto.appId,
        },
      },
    });
    if (!find) throw new NotFoundException('Записи настроек не существует');
    return this.prismaService.settings.update({
      where: {
        gameId_appId: {
          gameId: dto.gameId,
          appId: dto.appId,
        },
      },
      data: dto,
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
