export interface CompanyProfileDto {
  id: string;
  companyName: string;
  sector?: string | null;
  phone?: string | null;
  phoneVerifiedAt?: string | null;
  city: string;
  district?: string | null;
  membershipStatus: string;
  membershipExpiresAt?: string | null;
}

export interface UpdateCompanyProfileInput {
  companyName?: string;
  sector?: string;
  city?: string;
  district?: string;
}