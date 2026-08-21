import { AvailabilityStatus } from "./enums";

export interface CandidateProfileDto {
  id: string;
  fullName: string;
  phone?: string | null;
  city: string;
  district?: string | null;
  experienceYears: number;
  skills: string[];
  workPreferences: string[];
  primaryTradeCategory?: string | null;
  isPublic: boolean;
  photoUrl?: string | null;
  photoVisible: boolean;
  availabilityStatus: AvailabilityStatus;
}

export interface UpdateCandidateProfileInput {
  fullName?: string;
  phone?: string;
  city?: string;
  district?: string;
  experienceYears?: number;
  skills?: string[];
  workPreferences?: string[];
  primaryTradeCategory?: string;
  isPublic?: boolean;
  photoVisible?: boolean;
  availabilityStatus?: AvailabilityStatus;
}