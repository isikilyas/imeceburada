/** Bir ilan için kural tabanlı skorlamayla sıralanmış aday/taşeron önerisi. */
export interface JobMatchDto {
  applicantType: "CANDIDATE" | "SUBCONTRACTOR";
  /** applicantType'a göre candidateId ya da subcontractorId. */
  id: string;
  /** applicantType'a göre aday adı ya da firma adı. */
  name: string;
  city: string;
  district: string | null;
  /** 0-100 arası eşleşme skoru. */
  score: number;
  /** Skorun neden bu şekilde oluştuğunu açıklayan kısa etiketler, örn. "Aynı şehir". */
  reasons: string[];
  /** Bu ilana zaten başvurmuş mu. */
  alreadyApplied: boolean;
  experienceYears?: number;
  availabilityStatus?: string;
  averageRating?: number | null;
  reviewCount?: number;
}
