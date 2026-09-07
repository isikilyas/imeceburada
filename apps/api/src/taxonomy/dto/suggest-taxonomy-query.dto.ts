import { IsIn, IsString, Length } from "class-validator";
import { TAXONOMY_TERM_TYPES, TaxonomyTermType } from "@imeceburada/shared";

export class SuggestTaxonomyQueryDto {
  @IsIn(TAXONOMY_TERM_TYPES)
  type!: TaxonomyTermType;

  @IsString()
  @Length(1, 60)
  q!: string;
}
