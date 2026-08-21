import { Module } from "@nestjs/common";
import { PhoneVerificationService } from "./phone-verification.service";
import { PhoneVerificationController } from "./phone-verification.controller";
import { ConsoleSmsService, SMS_SERVICE } from "./sms.service";

@Module({
  controllers: [PhoneVerificationController],
  providers: [PhoneVerificationService, { provide: SMS_SERVICE, useClass: ConsoleSmsService }],
})
export class PhoneVerificationModule {}