import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/utils/paginated';
import { User } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const exists = await this.prismaService.user.findUnique({
      where: { id: createUserDto.id },
    });
    if (exists)
      throw new ConflictException('Пользователь с таким ID уже существует');
    const passwordHash = await hash(createUserDto.password, 10);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...payload } = createUserDto;
    return this.prismaService.user.create({
      data: {
        ...payload,
        passwordHash,
      },
    });
  }

  async findAll(pagination: PaginationParamsDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    try {
      const result = await this.prismaService.user.findMany({
        take: pagination.limit,
        skip,
        select: {
          id: true,
          role: true,
          first_name: true,
          last_name: true,
          is_bot: true,
          is_premium: true,
          username: true,
          apiKey: true,
          added_to_attachment_menu: true,
        },
      });
      const count = await this.prismaService.user.count();
      return new PaginatedResult<Partial<User>>(
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

  async findById(id: string) {
    const find = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!find)
      throw new NotFoundException('Пользователь с таким ID не существует');
    return find;
  }

  async findByUsername(username: string) {
    const find = await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });
    if (!find)
      throw new NotFoundException(
        'Пользователь с таким username не существует',
      );
    return find;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    return this.prismaService.user.update({
      where: { id: user.id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.findById(id);
    return this.prismaService.user.delete({
      where: { id: user.id },
    });
  }

  async findByApiKey(apiKey: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { apiKey },
    });
  }
}
