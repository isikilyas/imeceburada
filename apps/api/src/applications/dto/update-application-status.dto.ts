import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { ApplicationStatus } from "@imeceburada/shared";

const APPLICATION_STATUS_VALUES: ApplicationStatus[] = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

export class UpdateApplicationStatusDto {
  @IsIn(APPLICATION_STATUS_VALUES)
  status!: ApplicationStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  offeredWage?: number;
}
