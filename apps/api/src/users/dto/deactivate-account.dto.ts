import { IsString, MinLength } from "class-validator";

export class DeactivateAccountDto {
  /** Yanlışlıkla/başkasının açık bıraktığı oturumdan dondurma yapılmasını önlemek için tekrar şifre istenir. */
  @IsString()
  @MinLength(1)
  password!: string;
}
