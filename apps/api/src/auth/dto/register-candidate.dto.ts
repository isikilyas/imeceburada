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

  @IsOptional()
  @IsString()
  phone?: string;
}
