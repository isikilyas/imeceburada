import { IsArray, IsBoolean, IsOptional, IsString, Length } from "class-validator";

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
  @IsArray()
  @IsString({ each: true })
  @Length(2, 60, { each: true })
  supplyCategories?: string[];
}