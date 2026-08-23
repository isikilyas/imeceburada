import { EquipmentListingType, EquipmentStatus } from "./enums";

export interface EquipmentListingDto {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string | null;
  ownerVerified: boolean;
  equipmentType: string;
  capacity?: string | null;
  city: string;
  district?: string | null;
  listingType: EquipmentListingType;
  dailyRate?: number | null;
  hourlyRate?: number | null;
  salePrice?: number | null;
  photoUrl?: string | null;
  description: string;
  status: EquipmentStatus;
  createdAt: string;
}

export interface CreateEquipmentListingInput {
  equipmentType: string;
  capacity?: string;
  city: string;
  district?: string;
  listingType?: EquipmentListingType;
  dailyRate?: number;
  hourlyRate?: number;
  salePrice?: number;
  description: string;
}

export interface UpdateEquipmentListingInput extends Partial<CreateEquipmentListingInput> {
  status?: EquipmentStatus;
}

export interface EquipmentSearchQuery {
  equipmentType?: string;
  city?: string;
  district?: string;
  listingType?: EquipmentListingType;
  page?: number;
  pageSize?: number;
}
