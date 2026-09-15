import { IsOptional, IsString, Length } from "class-validator";

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  title?: string;
}
