import { IsIn, IsInt, IsOptional, IsString, Length, Min } from "class-validator";
import { ExperienceLevel, PriceSubmissionType, WagePeriod, WageSubjectType } from "@imeceburada/shared";

const EXPERIENCE_LEVEL_VALUES: ExperienceLevel[] = ["JUNIOR", "MID", "SENIOR"];
const WAGE_PERIOD_VALUES: WagePeriod[] = ["DAILY", "MONTHLY", "HOURLY"];
const PRICE_SUBMISSION_TYPE_VALUES: PriceSubmissionType[] = ["ACTUAL", "OFFER"];
const WAGE_SUBJECT_TYPE_VALUES: WageSubjectType[] = ["INDIVIDUAL", "TEAM", "EQUIPMENT"];

export class CreateWageSubmissionDto {
  @IsIn(WAGE_SUBJECT_TYPE_VALUES)
  subjectType!: WageSubjectType;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  tradeCategory?: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsIn(EXPERIENCE_LEVEL_VALUES)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  teamSize?: number;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  equipmentType?: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsIn(WAGE_PERIOD_VALUES)
  period!: WagePeriod;

  @IsIn(PRICE_SUBMISSION_TYPE_VALUES)
  submissionType!: PriceSubmissionType;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;
}
