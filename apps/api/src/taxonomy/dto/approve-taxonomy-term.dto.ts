import { IsOptional, IsString, Length } from "class-validator";

export class ApproveTaxonomyTermDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  label?: string;
}
