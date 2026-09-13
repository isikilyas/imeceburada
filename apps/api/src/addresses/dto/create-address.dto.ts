import { IsBoolean, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateAddressDto {
  @IsString()
  @Length(1, 60)
  label!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString()
  @MaxLength(300)
  line!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
