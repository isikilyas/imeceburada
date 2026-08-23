import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { MATERIAL_CATEGORY_ITEM_VALUES } from "@imeceburada/shared";

export class RegisterSupplierDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  companyName!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsArray()
  @IsIn(MATERIAL_CATEGORY_ITEM_VALUES, { each: true })
  supplyCategories?: string[];
}