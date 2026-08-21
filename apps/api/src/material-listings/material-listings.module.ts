import { Module } from "@nestjs/common";
import { MaterialListingsService } from "./material-listings.service";
import { MaterialListingsController } from "./material-listings.controller";
import { MembershipModule } from "../membership/membership.module";

@Module({
  imports: [MembershipModule],
  controllers: [MaterialListingsController],
  providers: [MaterialListingsService],
})
export class MaterialListingsModule {}