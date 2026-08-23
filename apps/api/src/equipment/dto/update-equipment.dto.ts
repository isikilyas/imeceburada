import { PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";
import { EquipmentStatus } from "@imeceburada/shared";
import { CreateEquipmentDto } from "./create-equipment.dto";

const EQUIPMENT_STATUS_VALUES: EquipmentStatus[] = ["AVAILABLE", "RENTED", "SOLD", "INACTIVE"];

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @IsOptional()
  @IsIn(EQUIPMENT_STATUS_VALUES)
  status?: EquipmentStatus;
}
