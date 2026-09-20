import { IsIn, IsOptional } from "class-validator";
import { TURKISH_PROVINCES } from "@imeceburada/shared";

export class WageHomepageSummaryQueryDto {
  /** Verilirse sadece o ile ait veriler özetlenir; verilmezse Türkiye geneli. */
  @IsOptional()
  @IsIn(TURKISH_PROVINCES)
  city?: string;
}
