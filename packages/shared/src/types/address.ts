export interface AddressDto {
  id: string;
  label: string;
  city: string;
  district?: string | null;
  line: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  label: string;
  city: string;
  district?: string;
  line: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  label?: string;
  city?: string;
  district?: string;
  line?: string;
  isDefault?: boolean;
}
