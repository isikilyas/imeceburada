import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterCandidateDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  /**
   * Kimlik doğrulama iki yoldan biriyle yapılır: telefon (phone+phoneCode)
   * ya da e-posta (emailCode) — ikisinden tam olarak biri dolu olmalı,
   * bkz. AuthService.registerCandidate.
   */
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  phoneCode?: string;

  /** E-postaya gönderilen 6 haneli doğrulama kodu (telefon yerine bu kullanılabilir). */
  @IsOptional()
  @IsString()
  @MinLength(6)
  emailCode?: string;
}
