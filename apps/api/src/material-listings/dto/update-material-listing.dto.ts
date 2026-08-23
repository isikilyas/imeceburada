import { PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";
import { MaterialListingStatus } from "@imeceburada/shared";
import { CreateMaterialListingDto } from "./create-material-listing.dto";

const MATERIAL_LISTING_STATUS_VALUES: MaterialListingStatus[] = ["AVAILABLE", "INACTIVE"];

export class UpdateMaterialListingDto extends PartialType(CreateMaterialListingDto) {
  @IsOptional()
  @IsIn(MATERIAL_LISTING_STATUS_VALUES)
  status?: MaterialListingStatus;
}