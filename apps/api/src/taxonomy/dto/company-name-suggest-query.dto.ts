import { IsString, Length } from "class-validator";

export class CompanyNameSuggestQueryDto {
  @IsString()
  @Length(1, 120)
  name!: string;
}
