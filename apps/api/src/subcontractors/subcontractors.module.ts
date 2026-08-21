import { Module } from "@nestjs/common";
import { SubcontractorsService } from "./subcontractors.service";
import { SubcontractorsController } from "./subcontractors.controller";
import { MembershipModule } from "../membership/membership.module";

@Module({
  imports: [MembershipModule],
  controllers: [SubcontractorsController],
  providers: [SubcontractorsService],
})
export class SubcontractorsModule {}