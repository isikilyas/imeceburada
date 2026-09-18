import { ApplicationStatus } from "./enums";

export interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
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
