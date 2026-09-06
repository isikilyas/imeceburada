import { IsEmail } from "class-validator";

export class RequestRegistrationEmailCodeDto {
  @IsEmail()
  email!: string;
}
