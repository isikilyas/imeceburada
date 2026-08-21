import {
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { EQUIPMENT_TYPE_VALUES, SiteRequestType, TRADE_CATEGORY_VALUES } from "@bau360/shared";

const SITE_REQUEST_TYPE_VALUES: SiteRequestType[] = ["WORKER", "EQUIPMENT"];

export class CreateSiteRequestDto {
  @IsIn(SITE_REQUEST_TYPE_VALUES)
  requestType!: SiteRequestType;

  @IsOptional()
  @IsIn(TRADE_CATEGORY_VALUES)
  tradeCategory?: string;

  @IsOptional()
  @IsIn(EQUIPMENT_TYPE_VALUES)
  equipmentType?: string;

  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  neededCount?: number;

  @IsOptional()
  @IsDateString()
  neededBy?: string;
}
