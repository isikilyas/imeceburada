import { Module } from "@nestjs/common";
import { TaxonomyService } from "./taxonomy.service";
import { TaxonomyController } from "./taxonomy.controller";
import { AdminTaxonomyController } from "./admin-taxonomy.controller";

@Module({
  controllers: [TaxonomyController, AdminTaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
