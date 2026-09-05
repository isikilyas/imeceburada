import { IsString, MinLength } from "class-validator";

export class VerifyPhoneLoginDto {
  @IsString()
  @MinLength(10)
  phone!: string;

  @IsString()
  @MinLength(6)
  code!: string;
}
