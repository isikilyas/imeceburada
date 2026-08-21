import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { UsersModule } from "../users/users.module";
import { MembershipModule } from "../membership/membership.module";

@Module({
  imports: [UsersModule, MembershipModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
