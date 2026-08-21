import { AvailabilityStatus } from "./enums";

export interface CandidateDirectoryEntryDto {
  id: string;
  fullName: string;
  city: string;
  district?: string | null;
  experienceYears: number;
  primaryTradeCategory?: string | null;
  skills: string[];
  workPreferences: string[];
  availabilityStatus: AvailabilityStatus;
  photoUrl?: string | null;
}

export interface CandidateDirectoryDetailDto extends CandidateDirectoryEntryDto {
  phone?: string | null;
}

export interface CandidateDirectorySearchQuery {
  tradeCategory?: string;
  city?: string;
  district?: string;
  page?: number;
  pageSize?: number;
}