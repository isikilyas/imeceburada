import { Module } from "@nestjs/common";
import { PhoneVerificationService } from "./phone-verification.service";
import { PhoneVerificationController } from "./phone-verification.controller";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [PhoneVerificationController],
  providers: [PhoneVerificationService],
})
export class PhoneVerificationModule {}
