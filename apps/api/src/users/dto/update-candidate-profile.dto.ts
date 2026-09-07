import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Min } from "class-validator";
import { AvailabilityStatus, WORK_PREFERENCE_VALUES } from "@imeceburada/shared";

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
  @IsString()
  @Length(2, 60)
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
