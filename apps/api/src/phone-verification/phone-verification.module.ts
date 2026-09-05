import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PhoneVerificationService } from "./phone-verification.service";
import { PhoneVerificationController } from "./phone-verification.controller";
import { ConsoleSmsService, SMS_SERVICE } from "./sms.service";
import { NetgsmSmsService } from "./netgsm-sms.service";

@Module({
  controllers: [PhoneVerificationController],
  providers: [
    PhoneVerificationService,
    NetgsmSmsService,
    ConsoleSmsService,
    {
      // NETGSM_USERCODE tanımlıysa gerçek SMS gönderilir; tanımlı değilse
      // (yerel geliştirmede olduğu gibi) kodu sadece loglayan sürüme düşer.
      provide: SMS_SERVICE,
      useFactory: (config: ConfigService, netgsm: NetgsmSmsService, console: ConsoleSmsService) =>
        config.get<string>("NETGSM_USERCODE") ? netgsm : console,
      inject: [ConfigService, NetgsmSmsService, ConsoleSmsService],
    },
  ],
})
export class PhoneVerificationModule {}