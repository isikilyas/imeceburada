import { Module } from "@nestjs/common";
import { MaterialIndexService } from "./material-index.service";
import { MaterialIndexController } from "./material-index.controller";
import { TaxonomyModule } from "../taxonomy/taxonomy.module";

@Module({
  imports: [TaxonomyModule],
  controllers: [MaterialIndexController],
  providers: [MaterialIndexService],
})
export class MaterialIndexModule {}
