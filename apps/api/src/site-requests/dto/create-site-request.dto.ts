import {
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
} from "class-validator";
import { SiteRequestType } from "@imeceburada/shared";

const SITE_REQUEST_TYPE_VALUES: SiteRequestType[] = ["WORKER", "EQUIPMENT"];

export class CreateSiteRequestDto {
  @IsIn(SITE_REQUEST_TYPE_VALUES)
  requestType!: SiteRequestType;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  tradeCategory?: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
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
