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
   * Kimlik doğrulama iki yoldan biriyle yapılır: telefon (phone+phoneCode)
   * ya da e-posta (emailCode) — ikisinden tam olarak biri dolu olmalı.
   */
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  phoneCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  emailCode?: string;
}