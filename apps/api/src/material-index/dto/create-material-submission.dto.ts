import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { MATERIAL_TYPE_VALUES, PriceSubmissionType } from "@imeceburada/shared";

const PRICE_SUBMISSION_TYPE_VALUES: PriceSubmissionType[] = ["ACTUAL", "OFFER"];

export class CreateMaterialSubmissionDto {
  @IsIn(MATERIAL_TYPE_VALUES)
  materialType!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsIn(PRICE_SUBMISSION_TYPE_VALUES)
  submissionType!: PriceSubmissionType;
}