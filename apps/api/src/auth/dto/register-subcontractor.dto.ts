import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, Length, MinLength } from "class-validator";

export class RegisterSubcontractorDto {
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

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Length(2, 60, { each: true })
  tradeCategories!: string[];

  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Zorunlu — piyasa endeksine (ücret/fiyat) girilen verilerin doğruluğunu
   * korumak için her telefon numarası tek bir hesaba bağlıdır. Ayrıca
   * doğrulama kodu istenmez.
   */
  @IsString()
  @MinLength(10)
  phone!: string;
}
