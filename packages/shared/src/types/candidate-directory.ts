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
  machineSpecialties: string[];
  availabilityStatus: AvailabilityStatus;
  photoUrl?: string | null;
}

export interface CandidateDirectoryDetailDto extends CandidateDirectoryEntryDto {
  phone?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  /** Sadece availabilityStatus BUSY iken anlamlı. */
  availableFrom?: string | null;
}

export interface CandidateDirectorySearchQuery {
  tradeCategory?: string;
  city?: string;
  district?: string;
  /** Sadece tradeCategory "HAFRIYAT_OPERATORU" iken anlamlı bir filtre. */
  machineSpecialty?: string;
  page?: number;
  pageSize?: number;
}