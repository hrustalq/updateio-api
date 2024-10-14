import { OmitType } from "@nestjs/swagger";
import { User } from "../entities/user.entity";

export class GetMeResponseDto extends OmitType(User, ["passwordHash"]) {}