import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { SiteRequestType } from "@imeceburada/shared";

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;
}
