export type MaterialListingStatus = "AVAILABLE" | "INACTIVE";

export interface MaterialListingDto {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string | null;
  materialType: string;
  unit: string;
  city: string;
  district?: string | null;
  price: number;
  photoUrl?: string | null;
  description: string;
  status: MaterialListingStatus;
  createdAt: string;
}

export interface CreateMaterialListingInput {
  materialType: string;
  city: string;
  district?: string;
  price: number;
  description: string;
}

export interface UpdateMaterialListingInput extends Partial<CreateMaterialListingInput> {
  status?: MaterialListingStatus;
}

export interface MaterialListingSearchQuery {
  materialType?: string;
  city?: string;
  district?: string;
  page?: number;
  pageSize?: number;
}