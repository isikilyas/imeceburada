import { Module } from "@nestjs/common";
import { CandidatesService } from "./candidates.service";
import { CandidatesController } from "./candidates.controller";
import { MembershipModule } from "../membership/membership.module";

@Module({
  imports: [MembershipModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidatesModule {}