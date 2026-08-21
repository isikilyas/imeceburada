export interface SubcontractorProfileDto {
  id: string;
  companyName: string;
  phone?: string | null;
  phoneVerifiedAt?: string | null;
  city: string;
  district?: string | null;
  tradeCategories: string[];
  description?: string | null;
  isPublic: boolean;
  membershipStatus: string;
  membershipExpiresAt?: string | null;
}

export interface UpdateSubcontractorProfileInput {
  companyName?: string;
  city?: string;
  district?: string;
  tradeCategories?: string[];
  description?: string;
  isPublic?: boolean;
}