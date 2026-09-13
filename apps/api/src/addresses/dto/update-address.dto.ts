import { IsBoolean, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  label?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  line?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
