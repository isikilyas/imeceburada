import { Module } from "@nestjs/common";
import { MaterialListingsService } from "./material-listings.service";
import { MaterialListingsController } from "./material-listings.controller";
import { MembershipModule } from "../membership/membership.module";
import { TaxonomyModule } from "../taxonomy/taxonomy.module";

@Module({
  imports: [MembershipModule, TaxonomyModule],
  controllers: [MaterialListingsController],
  providers: [MaterialListingsService],
})
export class MaterialListingsModule {}