import { ArrayMinSize, IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { TRADE_CATEGORY_VALUES } from "@imeceburada/shared";

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
  @IsIn(TRADE_CATEGORY_VALUES, { each: true })
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
