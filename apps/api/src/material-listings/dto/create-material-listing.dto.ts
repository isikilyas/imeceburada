import { IsInt, IsOptional, IsString, Length, Min, MinLength } from "class-validator";

export class CreateMaterialListingDto {
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
  price!: number;

  @IsString()
  @MinLength(10)
  description!: string;
}