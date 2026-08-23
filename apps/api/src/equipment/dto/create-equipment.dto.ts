import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
import { EQUIPMENT_TYPE_VALUES, EquipmentListingType } from "@imeceburada/shared";

const EQUIPMENT_LISTING_TYPE_VALUES: EquipmentListingType[] = ["RENT", "SALE"];

export class CreateEquipmentDto {
  @IsIn(EQUIPMENT_TYPE_VALUES)
  equipmentType!: string;

  @IsOptional()
  @IsString()
  capacity?: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsIn(EQUIPMENT_LISTING_TYPE_VALUES)
  listingType?: EquipmentListingType;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salePrice?: number;

  @IsString()
  @MinLength(10)
  description!: string;
}
