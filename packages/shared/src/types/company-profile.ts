export interface CompanyProfileDto {
  id: string;
  companyName: string;
  sector?: string | null;
  phone?: string | null;
  phoneVisible: boolean;
  phoneVerifiedAt?: string | null;
  city: string;
  district?: string | null;
  address?: string | null;
  description?: string | null;
  authorizedPersonName?: string | null;
  taxOffice?: string | null;
  taxNumber?: string | null;
  mersisNumber?: string | null;
  website?: string | null;
  companyEmail?: string | null;
  logoUrl?: string | null;
  membershipStatus: string;
  membershipExpiresAt?: string | null;
}

export interface UpdateCompanyProfileInput {
  companyName?: string;
  sector?: string;
  city?: string;
  district?: string;
  address?: string;
  description?: string;
  authorizedPersonName?: string;
  taxOffice?: string;
  taxNumber?: string;
  mersisNumber?: string;
  website?: string;
  companyEmail?: string;
  phoneVisible?: boolean;
}
