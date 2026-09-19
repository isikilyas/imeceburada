import { ApplicationStatus } from "./enums";

export interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  /** Başvuran aday mı yoksa taşeron firma mı. */
  applicantType: "CANDIDATE" | "SUBCONTRACTOR";
  /** applicantType'a göre candidateId ya da subcontractorId. */
  applicantId: string;
  /** applicantType'a göre aday adı ya da firma adı. */
  applicantName: string;
  status: ApplicationStatus;
  /** Adayın başvuru sırasında belirttiği beklenen ücret (aylık, TL). */
  expectedWage?: number | null;
  /** Firmanın bu başvuruya özel teklif ettiği ücret (aylık, TL). */
  offeredWage?: number | null;
  createdAt: string;
}

export interface CreateApplicationInput {
  jobId: string;
  message?: string;
  expectedWage?: number;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  offeredWage?: number;
}
