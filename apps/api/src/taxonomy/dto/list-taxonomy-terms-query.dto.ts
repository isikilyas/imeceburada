import { IsIn, IsOptional } from "class-validator";
import { TAXONOMY_TERM_TYPES, TaxonomyTermType, TaxonomyTermStatus } from "@imeceburada/shared";

const TAXONOMY_TERM_STATUSES: TaxonomyTermStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export class ListTaxonomyTermsQueryDto {
  @IsOptional()
  @IsIn(TAXONOMY_TERM_STATUSES)
  status?: TaxonomyTermStatus;

  @IsOptional()
  @IsIn(TAXONOMY_TERM_TYPES)
  type?: TaxonomyTermType;
}
