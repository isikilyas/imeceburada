import { IsIn, IsInt, IsOptional, IsString, Length, Min } from "class-validator";
import { PriceSubmissionType } from "@imeceburada/shared";

const PRICE_SUBMISSION_TYPE_VALUES: PriceSubmissionType[] = ["ACTUAL", "OFFER"];

export class CreateMaterialSubmissionDto {
  @IsString()
  @Length(2, 60)
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