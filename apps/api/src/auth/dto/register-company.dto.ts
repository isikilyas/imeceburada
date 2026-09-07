import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterCompanyDto {
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
  @IsString()
  sector?: string;

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
