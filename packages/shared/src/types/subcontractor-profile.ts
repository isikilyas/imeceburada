export interface SubcontractorProfileDto {
  id: string;
  companyName: string;
  phone?: string | null;
  phoneVisible: boolean;
  phoneVerifiedAt?: string | null;
  city: string;
  district?: string | null;
  address?: string | null;
  tradeCategories: string[];
  description?: string | null;
  authorizedPersonName?: string | null;
  taxOffice?: string | null;
  taxNumber?: string | null;
  mersisNumber?: string | null;
  website?: string | null;
  companyEmail?: string | null;
  logoUrl?: string | null;
  isPublic: boolean;
  membershipStatus: string;
  membershipExpiresAt?: string | null;
}

export interface UpdateSubcontractorProfileInput {
  companyName?: string;
  city?: string;
  district?: string;
  address?: string;
  tradeCategories?: string[];
  description?: string;
  authorizedPersonName?: string;
  taxOffice?: string;
  taxNumber?: string;
  mersisNumber?: string;
  website?: string;
  companyEmail?: string;
  isPublic?: boolean;
  phoneVisible?: boolean;
}
