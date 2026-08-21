export type FavoriteListingType = "JOB" | "EQUIPMENT" | "MATERIAL_LISTING" | "SITE_REQUEST";

export const FAVORITE_LISTING_TYPES: { value: FavoriteListingType; label: string }[] = [
  { value: "JOB", label: "İş İlanı" },
  { value: "EQUIPMENT", label: "Ekipman İlanı" },
  { value: "MATERIAL_LISTING", label: "Malzeme İlanı" },
  { value: "SITE_REQUEST", label: "Şantiye Radarı" },
];

export interface FavoriteDto {
  id: string;
  listingType: FavoriteListingType;
  listingId: string;
  createdAt: string;
}

export interface CreateFavoriteInput {
  listingType: FavoriteListingType;
  listingId: string;
}
