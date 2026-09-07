import { Module } from "@nestjs/common";
import { SiteRequestsService } from "./site-requests.service";
import { SiteRequestsController } from "./site-requests.controller";
import { TaxonomyModule } from "../taxonomy/taxonomy.module";

@Module({
  imports: [TaxonomyModule],
  controllers: [SiteRequestsController],
  providers: [SiteRequestsService],
})
export class SiteRequestsModule {}
