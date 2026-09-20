import { IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Max, Min, MaxLength } from "class-validator";
import { AvailabilityStatus, EXCAVATION_MACHINE_TYPE_VALUES, WORK_PREFERENCE_VALUES } from "@imeceburada/shared";

const AVAILABILITY_STATUS_VALUES: AvailabilityStatus[] = ["AVAILABLE", "BUSY"];

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  phoneVisible?: boolean;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

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
  @IsArray()
  @IsIn(EXCAVATION_MACHINE_TYPE_VALUES, { each: true })
  machineSpecialties?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  photoVisible?: boolean;

  @IsOptional()
  @IsIn(AVAILABILITY_STATUS_VALUES)
  availabilityStatus?: AvailabilityStatus;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsBoolean()
  notifyByEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  hasProfessionalQualificationCert?: boolean;

  @IsOptional()
  @IsBoolean()
  hasMasterCraftsmanCert?: boolean;

  @IsOptional()
  @IsBoolean()
  hasOshCert?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  serviceRadiusKm?: number;
}
