import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { MATERIAL_CATEGORY_ITEM_VALUES } from "@imeceburada/shared";

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
  @IsIn(MATERIAL_CATEGORY_ITEM_VALUES, { each: true })
  supplyCategories?: string[];

  /** requestRegistrationPhoneCode ile SMS gönderilen numaranın aynısı olmalı. */
  @IsString()
  @MinLength(10)
  phone!: string;

  /** O numaraya gönderilen 6 haneli doğrulama kodu. */
  @IsString()
  @MinLength(6)
  phoneCode!: string;
}