import { PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";
import { JobStatus } from "@bau360/shared";
import { CreateJobDto } from "./create-job.dto";

const JOB_STATUS_VALUES: JobStatus[] = ["ACTIVE", "CLOSED"];

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsOptional()
  @IsIn(JOB_STATUS_VALUES)
  status?: JobStatus;
}
