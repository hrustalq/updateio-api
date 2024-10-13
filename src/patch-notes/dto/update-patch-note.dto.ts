import { PartialType } from '@nestjs/swagger';
import { CreatePatchNoteDto } from './create-patch-note.dto';

export class UpdatePatchNoteDto extends PartialType(CreatePatchNoteDto) {}
