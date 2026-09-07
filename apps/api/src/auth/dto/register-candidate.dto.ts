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
   * Zorunlu — piyasa endeksine (ücret/fiyat) girilen verilerin doğruluğunu
   * korumak için her telefon numarası tek bir hesaba bağlıdır. Ayrıca
   * doğrulama kodu istenmez.
   */
  @IsString()
  @MinLength(10)
  phone!: string;
}
