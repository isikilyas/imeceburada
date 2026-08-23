import { IsIn, IsString } from "class-validator";
import { FavoriteListingType } from "@imeceburada/shared";

const FAVORITE_LISTING_TYPE_VALUES: FavoriteListingType[] = ["JOB", "EQUIPMENT", "MATERIAL_LISTING", "SITE_REQUEST"];

export class CreateFavoriteDto {
  @IsIn(FAVORITE_LISTING_TYPE_VALUES)
  listingType!: FavoriteListingType;

  @IsString()
  listingId!: string;
}
