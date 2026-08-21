export interface SupplierProfileDto {
  id: string;
  companyName: string;
  phone?: string | null;
  phoneVerifiedAt?: string | null;
  city: string;
  district?: string | null;
  supplyCategories: string[];
  membershipStatus: string;
  membershipExpiresAt?: string | null;
}

export interface UpdateSupplierProfileInput {
  companyName?: string;
  city?: string;
  district?: string;
  supplyCategories?: string[];
}