import { IsOptional, IsString, Length, Matches } from "class-validator";

export class UpdateUsernameDto {
  /** Boş/null gönderilirse kullanıcı adı kaldırılır. */
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_.]+$/, { message: "Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir" })
  username?: string | null;
}
