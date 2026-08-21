import { IsArray, IsIn, IsOptional, IsString } from "class-validator";
import { MATERIAL_CATEGORY_ITEM_VALUES } from "@bau360/shared";

export class UpdateSupplierProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsArray()
  @IsIn(MATERIAL_CATEGORY_ITEM_VALUES, { each: true })
  supplyCategories?: string[];
}