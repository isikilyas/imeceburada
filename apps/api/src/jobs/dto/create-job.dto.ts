import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
import { EmploymentType, LISTING_INTENT_VALUES, ListingIntent, TRADE_CATEGORY_VALUES } from "@imeceburada/shared";

const EMPLOYMENT_TYPE_VALUES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "DAILY", "CONTRACT"];

export class CreateJobDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsIn(LISTING_INTENT_VALUES)
  listingType!: ListingIntent;

  @IsIn(TRADE_CATEGORY_VALUES)
  tradeCategory!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsIn(EMPLOYMENT_TYPE_VALUES)
  employmentType!: EmploymentType;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsString()
  @MinLength(10)
  description!: string;
}
