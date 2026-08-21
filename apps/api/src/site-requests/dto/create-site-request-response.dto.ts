import { IsOptional, IsString } from "class-validator";

export class CreateSiteRequestResponseDto {
  @IsOptional()
  @IsString()
  message?: string;
}
