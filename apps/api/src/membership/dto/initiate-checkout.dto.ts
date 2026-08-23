import { IsIn, IsOptional, IsString, Length } from "class-validator";
import { MembershipPlan } from "@imeceburada/shared";

const MEMBERSHIP_PLAN_VALUES: MembershipPlan[] = ["MONTHLY", "YEARLY"];

export class InitiateCheckoutDto {
  @IsIn(MEMBERSHIP_PLAN_VALUES)
  plan!: MembershipPlan;

  @IsString()
  @Length(10, 11)
  identityNumber!: string;

  @IsString()
  billingContactName!: string;

  @IsString()
  billingCity!: string;

  @IsString()
  billingAddress!: string;

  @IsOptional()
  @IsString()
  billingZipCode?: string;
}