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

  /** requestRegistrationPhoneCode ile SMS gönderilen numaranın aynısı olmalı. */
  @IsString()
  @MinLength(10)
  phone!: string;

  /** O numaraya gönderilen 6 haneli doğrulama kodu. */
  @IsString()
  @MinLength(6)
  phoneCode!: string;
}
