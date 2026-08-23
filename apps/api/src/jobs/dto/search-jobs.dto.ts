import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { EmploymentType, LISTING_INTENT_VALUES, ListingIntent } from "@imeceburada/shared";

const EMPLOYMENT_TYPE_VALUES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "DAILY", "CONTRACT"];

export class SearchJobsDto {
  @IsOptional()
  @IsIn(LISTING_INTENT_VALUES)
  listingType?: ListingIntent;

  @IsOptional()
  @IsString()
  tradeCategory?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsIn(EMPLOYMENT_TYPE_VALUES)
  employmentType?: EmploymentType;

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
