import { IsString, MinLength } from "class-validator";

export class DeleteAccountDto {
  /** Yanlışlıkla/başkasının açık bıraktığı oturumdan silme yapılmasını önlemek için tekrar şifre istenir. */
  @IsString()
  @MinLength(1)
  password!: string;
}
