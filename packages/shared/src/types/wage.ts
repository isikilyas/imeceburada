import { ExperienceLevel, PriceSubmissionType, WagePeriod } from "./enums";

export interface CreateWageSubmissionInput {
  tradeCategory: string;
  city: string;
  district?: string;
  experienceLevel: ExperienceLevel;
  amount: number;
  period: WagePeriod;
  submissionType: PriceSubmissionType;
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