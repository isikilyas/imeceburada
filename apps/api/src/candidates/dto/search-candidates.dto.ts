import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { EXCAVATION_MACHINE_TYPE_VALUES } from "@imeceburada/shared";

export class SearchCandidatesDto {
  @IsOptional()
  @IsString()
  tradeCategory?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  /** Sadece tradeCategory "HAFRIYAT_OPERATORU" ile birlikte anlamlı bir filtre. */
  @IsOptional()
  @IsIn(EXCAVATION_MACHINE_TYPE_VALUES)
  machineSpecialty?: string;

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