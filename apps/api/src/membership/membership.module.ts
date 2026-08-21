import { Module } from "@nestjs/common";
import { MembershipService } from "./membership.service";
import { MembershipController } from "./membership.controller";
import { MembershipGuard } from "./guards/membership.guard";

@Module({
  controllers: [MembershipController],
  providers: [MembershipService, MembershipGuard],
  exports: [MembershipGuard],
})
export class MembershipModule {}