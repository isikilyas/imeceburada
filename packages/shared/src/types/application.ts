import { ApplicationStatus } from "./enums";

export interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface CreateApplicationInput {
  jobId: string;
  message?: string;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
}
