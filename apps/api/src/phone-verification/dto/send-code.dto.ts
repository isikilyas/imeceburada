import { IsString, Matches } from "class-validator";

export class SendCodeDto {
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: "Geçerli bir telefon numarası giriniz" })
  phone!: string;
}