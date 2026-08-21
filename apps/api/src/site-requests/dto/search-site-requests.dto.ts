import { IsIn, IsOptional, IsString } from "class-validator";
import { SiteRequestType } from "@bau360/shared";

const SITE_REQUEST_TYPE_VALUES: SiteRequestType[] = ["WORKER", "EQUIPMENT"];

export class SearchSiteRequestsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsIn(SITE_REQUEST_TYPE_VALUES)
  requestType?: SiteRequestType;
}
