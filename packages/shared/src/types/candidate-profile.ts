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
  /** Sadece BUSY durumundayken anlamlı — hangi tarihten itibaren müsait olunacağı. */
  availableFrom?: string | null;
  notifyByEmail: boolean;
  hasProfessionalQualificationCert: boolean;
  hasMasterCraftsmanCert: boolean;
  hasOshCert: boolean;
  serviceRadiusKm?: number | null;
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
  availableFrom?: string;
  notifyByEmail?: boolean;
  hasProfessionalQualificationCert?: boolean;
  hasMasterCraftsmanCert?: boolean;
  hasOshCert?: boolean;
  serviceRadiusKm?: number;
}
