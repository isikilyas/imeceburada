import { ExperienceLevel, PriceSubmissionType, WagePeriod, WageSubjectType } from "./enums";

export interface CreateWageSubmissionInput {
  subjectType: WageSubjectType;
  /** INDIVIDUAL/TEAM için zorunlu, EQUIPMENT'ta kullanılmaz. */
  tradeCategory?: string;
  city: string;
  district?: string;
  /** Sadece INDIVIDUAL'da gönderilir. */
  experienceLevel?: ExperienceLevel;
  /** Sadece TEAM'de gönderilir. */
  teamSize?: number;
  /** Sadece EQUIPMENT'ta zorunlu. */
  equipmentType?: string;
  amount: number;
  period: WagePeriod;
  submissionType: PriceSubmissionType;
  /** Profilinde kayıtlı telefonu olmayan kullanıcılar için — o zaman zorunludur. */
  phone?: string;
}

export interface WageIndexQuery {
  tradeCategory?: string;
  city?: string;
  district?: string;
  months?: number;
}

export interface WageIndexPoint {
  month: string;
  tradeCategory: string;
  city: string;
  district?: string | null;
  /** Sadece "Gerçekleşen/Ödenen" gönderimlerden hesaplanır — endeksin ana rakamı. */
  averageAmount: number;
  medianAmount: number;
  sampleSize: number;
  /** "Teklif/Beklenti" gönderimlerinden ortalama — örneklem eşiğin altındaysa null. */
  expectationAverage: number | null;
  expectationSampleSize: number;
}

/** Örneklem bu eşiğin altındaysa gizlilik nedeniyle sonuç döndürülmez. */
export const WAGE_INDEX_MIN_SAMPLE_SIZE = 3;

/** Ana sayfadaki "Türkiye Ortalaması" / "Bulunduğun Yer" özet slaytı için tek bir meslek satırı. */
export interface WageHomepageSummaryPoint {
  tradeCategory: string;
  averageAmount: number;
  sampleSize: number;
}

export interface WageHomepageSummaryResponse {
  scope: "NATIONAL" | "CITY";
  city: string | null;
  items: WageHomepageSummaryPoint[];
}

/** "Maaş Pusulam" — kullanıcının kendi mesleği + bölgesi için min/ortalama/maks ücret skalası. */
export interface WageScalePoint {
  tradeCategory: string;
  city: string;
  district?: string | null;
  period: WagePeriod;
  /** Sadece "Gerçekleşen/Ödenen" gönderimlerden hesaplanır. */
  minAmount: number;
  averageAmount: number;
  maxAmount: number;
  sampleSize: number;
  /** "Teklif/Beklenti" gönderimlerinden ortalama — örneklem eşiğin altındaysa null. */
  expectationAverage: number | null;
  expectationSampleSize: number;
}