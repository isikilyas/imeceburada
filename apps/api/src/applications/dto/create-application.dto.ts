import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateApplicationDto {
  @IsUUID()
  jobId!: string;

  @IsOptional()
  @IsString()
  message?: string;
}
