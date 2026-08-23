import { IsIn } from "class-validator";
import { SiteRequestResponseStatus } from "@imeceburada/shared";

const RESPONSE_STATUS_VALUES: SiteRequestResponseStatus[] = ["ACCEPTED", "REJECTED"];

export class UpdateSiteRequestResponseDto {
  @IsIn(RESPONSE_STATUS_VALUES)
  status!: SiteRequestResponseStatus;
}
