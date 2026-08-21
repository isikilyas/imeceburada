import { IsIn } from "class-validator";
import { ApplicationStatus } from "@bau360/shared";

const APPLICATION_STATUS_VALUES: ApplicationStatus[] = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

export class UpdateApplicationStatusDto {
  @IsIn(APPLICATION_STATUS_VALUES)
  status!: ApplicationStatus;
}
