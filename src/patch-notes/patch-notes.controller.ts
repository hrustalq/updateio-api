import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatchNotesService } from './patch-notes.service';
import { CreatePatchNoteDto } from './dto/create-patch-note.dto';
import { UpdatePatchNoteDto } from './dto/update-patch-note.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  PaginationQuery,
  PaginatedRequest,
} from '../common/decorators/paginated.decorator';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { GetPatchNotesResponseDto } from './dto/get-patch-note-response.dto';
import { ApiGlobalErrorResponses } from 'src/common/decorators/error-response.decorator';

@ApiTags('Патч-ноты')
@ApiGlobalErrorResponses()
@Controller('patch-notes')
export class PatchNotesController {
  constructor(private readonly patchNotesService: PatchNotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Создание нового патч-нота' })
  @ApiResponse({ status: 201, description: 'Патч-нот успешно создан' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания патч-нота',
  })
  @ApiConflictResponse({
    description: 'Патч-нот с таким названием уже существует',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при создании патч-нота',
  })
  async create(@Body() createPatchNoteDto: CreatePatchNoteDto) {
    const patchNote = await this.patchNotesService.create(createPatchNoteDto);
    return patchNote;
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Получение списка патч-нотов' })
  @ApiResponse({ status: 200, description: 'Список патч-нотов получен', type: GetPatchNotesResponseDto })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра списка патч-нотов',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении списка патч-нотов',
  })
  @PaginatedRequest()
  findAll(@PaginationQuery() pagination: PaginationParamsDto) {
    return this.patchNotesService.findAll(pagination);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Получение патч-нота по ID' })
  @ApiResponse({ status: 200, description: 'Патч-нот найден' })
  @ApiNotFoundResponse({ description: 'Патч-нот с указанным ID не найден' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для просмотра информации о патч-ноте',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при получении патч-нота',
  })
  findOne(@Param('id') id: string) {
    return this.patchNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Обновление данных патч-нота' })
  @ApiResponse({
    status: 200,
    description: 'Данные патч-нота успешно обновлены',
  })
  @ApiNotFoundResponse({ description: 'Патч-нот с указанным ID не найден' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения данных патч-нота',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при обновлении патч-нота',
  })
  update(
    @Param('id') id: string,
    @Body() updatePatchNoteDto: UpdatePatchNoteDto,
  ) {
    return this.patchNotesService.update(id, updatePatchNoteDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Удаление патч-нота' })
  @ApiResponse({ status: 200, description: 'Патч-нот успешно удален' })
  @ApiNotFoundResponse({ description: 'Патч-нот с указанным ID не найден' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления патч-нота',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка сервера при удалении патч-нота',
  })
  remove(@Param('id') id: string) {
    return this.patchNotesService.remove(id);
  }
}
