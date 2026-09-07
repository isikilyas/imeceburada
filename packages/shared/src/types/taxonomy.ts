import { UserRole } from "./enums";

/** Şu an akıllı doğrulama/fuzzy-matching kapsamındaki, geçmişte kapalı liste olan alanlar. */
export type TaxonomyTermType = "TRADE_PROFESSION" | "MATERIAL_TYPE" | "MATERIAL_CATEGORY_ITEM" | "EQUIPMENT_TYPE";

export const TAXONOMY_TERM_TYPES: TaxonomyTermType[] = [
  "TRADE_PROFESSION",
  "MATERIAL_TYPE",
  "MATERIAL_CATEGORY_ITEM",
  "EQUIPMENT_TYPE",
];

export type TaxonomyTermStatus = "PENDING" | "APPROVED" | "REJECTED";

export const TAXONOMY_SUGGESTION_THRESHOLD = 0.3;
export const TAXONOMY_SUGGESTION_LIMIT = 5;

export const COMPANY_NAME_SUGGESTION_THRESHOLD = 0.45;
export const COMPANY_NAME_SUGGESTION_LIMIT = 3;

export interface TaxonomySuggestion {
  value: string;
  label: string;
  source: "canonical" | "community";
  similarity: number;
}

export interface TaxonomySuggestResponse {
  query: string;
  exactMatch: boolean;
  suggestions: TaxonomySuggestion[];
}

export interface CompanyNameSuggestion {
  name: string;
  role: UserRole;
  similarity: number;
}

export interface AdminTaxonomyTerm {
  id: string;
  type: TaxonomyTermType;
  value: string;
  label: string;
  status: TaxonomyTermStatus;
  submittedByUserId: string | null;
  createdAt: string;
}
