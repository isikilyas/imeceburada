import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
import { MATERIAL_TYPE_VALUES } from "@imeceburada/shared";

export class CreateMaterialListingDto {
  @IsIn(MATERIAL_TYPE_VALUES)
  materialType!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsInt()
  @Min(1)
  price!: number;

  @IsString()
  @MinLength(10)
  description!: string;
}