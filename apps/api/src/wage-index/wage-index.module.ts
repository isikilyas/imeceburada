import { Module } from "@nestjs/common";
import { WageIndexService } from "./wage-index.service";
import { WageIndexController } from "./wage-index.controller";
import { TaxonomyModule } from "../taxonomy/taxonomy.module";

@Module({
  imports: [TaxonomyModule],
  controllers: [WageIndexController],
  providers: [WageIndexService],
})
export class WageIndexModule {}
