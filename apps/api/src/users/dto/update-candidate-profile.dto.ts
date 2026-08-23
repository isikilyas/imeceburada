import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { AvailabilityStatus, TRADE_CATEGORY_VALUES, WORK_PREFERENCE_VALUES } from "@imeceburada/shared";

const AVAILABILITY_STATUS_VALUES: AvailabilityStatus[] = ["AVAILABLE", "BUSY"];

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(WORK_PREFERENCE_VALUES, { each: true })
  workPreferences?: string[];

  @IsOptional()
  @IsIn(TRADE_CATEGORY_VALUES)
  primaryTradeCategory?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  photoVisible?: boolean;

  @IsOptional()
  @IsIn(AVAILABILITY_STATUS_VALUES)
  availabilityStatus?: AvailabilityStatus;
}
