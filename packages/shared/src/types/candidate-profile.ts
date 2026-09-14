import { AvailabilityStatus } from "./enums";

export interface CandidateProfileDto {
  id: string;
  fullName: string;
  phone?: string | null;
  phoneVisible: boolean;
  city: string;
  district?: string | null;
  address?: string | null;
  bio?: string | null;
  experienceYears: number;
  skills: string[];
  workPreferences: string[];
  primaryTradeCategory?: string | null;
  isPublic: boolean;
  photoUrl?: string | null;
  photoVisible: boolean;
  availabilityStatus: AvailabilityStatus;
  notifyByEmail: boolean;
}

export interface UpdateCandidateProfileInput {
  fullName?: string;
  phone?: string;
  phoneVisible?: boolean;
  city?: string;
  district?: string;
  address?: string;
  bio?: string;
  experienceYears?: number;
  skills?: string[];
  workPreferences?: string[];
  primaryTradeCategory?: string;
  isPublic?: boolean;
  photoVisible?: boolean;
  availabilityStatus?: AvailabilityStatus;
  notifyByEmail?: boolean;
}
