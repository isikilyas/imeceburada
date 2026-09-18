import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateApplicationDto {
  @IsUUID()
  jobId!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  expectedWage?: number;
}
