import { IsArray, IsEmail, IsOptional, IsString, Length, MinLength } from "class-validator";

export class RegisterSupplierDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  companyName!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 60, { each: true })
  supplyCategories?: string[];

  /**
   * Zorunlu — piyasa endeksine (ücret/fiyat) girilen verilerin doğruluğunu
   * korumak için her telefon numarası tek bir hesaba bağlıdır. Ayrıca
   * doğrulama kodu istenmez.
   */
  @IsString()
  @MinLength(10)
  phone!: string;
}
