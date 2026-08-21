import { IsIn, IsOptional } from "class-validator";
import { SiteRequestStatus } from "@bau360/shared";

const SITE_REQUEST_STATUS_VALUES: SiteRequestStatus[] = ["OPEN", "CLOSED"];

export class UpdateSiteRequestDto {
  @IsOptional()
  @IsIn(SITE_REQUEST_STATUS_VALUES)
  status?: SiteRequestStatus;
}
