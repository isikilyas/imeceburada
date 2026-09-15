export interface SupplierProfileDto {
  id: string;
  companyName: string;
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
  supplyCategories: string[];
  membershipStatus: string;
  membershipExpiresAt?: string | null;
  hasActivityCertificate: boolean;
}

export interface UpdateSupplierProfileInput {
  companyName?: string;
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
  supplyCategories?: string[];
  phoneVisible?: boolean;
  hasActivityCertificate?: boolean;
}
