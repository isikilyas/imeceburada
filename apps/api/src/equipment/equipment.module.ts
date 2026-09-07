import { Module } from "@nestjs/common";
import { EquipmentService } from "./equipment.service";
import { EquipmentController } from "./equipment.controller";
import { TaxonomyModule } from "../taxonomy/taxonomy.module";

@Module({
  imports: [TaxonomyModule],
  controllers: [EquipmentController],
  providers: [EquipmentService],
})
export class EquipmentModule {}
