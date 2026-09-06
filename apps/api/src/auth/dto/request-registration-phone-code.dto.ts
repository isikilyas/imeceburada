import { IsString, MinLength } from "class-validator";

export class RequestRegistrationPhoneCodeDto {
  @IsString()
  @MinLength(10)
  phone!: string;
}
