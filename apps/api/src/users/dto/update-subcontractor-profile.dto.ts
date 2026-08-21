import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import { TRADE_CATEGORY_VALUES } from "@bau360/shared";

export class UpdateSubcontractorProfileDto {
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
  @ArrayMinSize(1)
  @IsIn(TRADE_CATEGORY_VALUES, { each: true })
  tradeCategories?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}