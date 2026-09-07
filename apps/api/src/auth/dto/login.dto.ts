import { IsString, MinLength } from "class-validator";

export class LoginDto {
  /** E-posta ya da telefon numarası — "@" içeriyorsa e-posta, aksi halde telefon olarak aranır. */
  @IsString()
  @MinLength(3)
  identifier!: string;

  @IsString()
  password!: string;
}
