import { PriceSubmissionType } from "./enums";

export interface CreateMaterialPriceSubmissionInput {
  materialType: string;
  city: string;
  district?: string;
  amount: number;
  submissionType: PriceSubmissionType;
}

export interface MaterialIndexQuery {
  materialType?: string;
  city?: string;
  district?: string;
  months?: number;
}

export interface MaterialIndexPoint {
  month: string;
  materialType: string;
  city: string;
  district?: string | null;
  unit: string;
  /** Sadece "Gerçekleşen/Ödenen" gönderimlerden hesaplanır — endeksin ana rakamı. */
  averageAmount: number;
  medianAmount: number;
  sampleSize: number;
  /** "Teklif/Beklenti" gönderimlerinden ortalama — örneklem eşiğin altındaysa null. */
  expectationAverage: number | null;
  expectationSampleSize: number;
}