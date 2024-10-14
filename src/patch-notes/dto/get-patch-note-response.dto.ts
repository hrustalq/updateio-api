import { ApiProperty } from "@nestjs/swagger";
import { PatchNote } from "../entities/patch-note.entity";

export class GetPatchNotesResponseDto {
  @ApiProperty({ type: [PatchNote], description: 'Список игр' })
  data: PatchNote[];

  @ApiProperty({ example: 1, description: 'Текущий номер страницы' })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Количество записей для одной страницы',
  })
  perPage: number;

  @ApiProperty({ example: 100, description: 'Общее количество записей' })
  total: number;

  @ApiProperty({ example: 10, description: 'Общее количество страниц' })
  pageCount: number;
}