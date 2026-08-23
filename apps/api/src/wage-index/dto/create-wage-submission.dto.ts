import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ExperienceLevel, PriceSubmissionType, TRADE_CATEGORY_VALUES, WagePeriod } from "@imeceburada/shared";

const EXPERIENCE_LEVEL_VALUES: ExperienceLevel[] = ["JUNIOR", "MID", "SENIOR"];
const WAGE_PERIOD_VALUES: WagePeriod[] = ["DAILY", "MONTHLY", "HOURLY"];
const PRICE_SUBMISSION_TYPE_VALUES: PriceSubmissionType[] = ["ACTUAL", "OFFER"];

export class CreateWageSubmissionDto {
  @IsIn(TRADE_CATEGORY_VALUES)
  tradeCategory!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsIn(EXPERIENCE_LEVEL_VALUES)
  experienceLevel!: ExperienceLevel;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsIn(WAGE_PERIOD_VALUES)
  period!: WagePeriod;

  @IsIn(PRICE_SUBMISSION_TYPE_VALUES)
  submissionType!: PriceSubmissionType;
}
