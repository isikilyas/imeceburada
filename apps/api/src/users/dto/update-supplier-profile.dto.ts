import { IsArray, IsBoolean, IsEmail, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from "class-validator";

export class UpdateSupplierProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

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
  description?: string;

  @IsOptional()
  @IsString()
  authorizedPersonName?: string;

  @IsOptional()
  @IsString()
  taxOffice?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  mersisNumber?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 60, { each: true })
  supplyCategories?: string[];

  @IsOptional()
  @IsBoolean()
  hasActivityCertificate?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  serviceRadiusKm?: number;
}
