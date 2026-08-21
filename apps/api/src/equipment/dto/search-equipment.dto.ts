import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { EquipmentListingType } from "@bau360/shared";

const EQUIPMENT_LISTING_TYPE_VALUES: EquipmentListingType[] = ["RENT", "SALE"];

export class SearchEquipmentDto {
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsIn(EQUIPMENT_LISTING_TYPE_VALUES)
  listingType?: EquipmentListingType;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;
}
