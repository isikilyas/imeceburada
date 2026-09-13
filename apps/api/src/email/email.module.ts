import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConsoleEmailService, EMAIL_SERVICE } from "./email.service";
import { ResendEmailService } from "./resend-email.service";

@Module({
  providers: [
    ResendEmailService,
    ConsoleEmailService,
    {
      // RESEND_API_KEY tanımlıysa gerçek e-posta gönderilir; tanımlı değilse
      // (yerel geliştirmede olduğu gibi) kodu/linki sadece loglayan sürüme düşer.
      provide: EMAIL_SERVICE,
      useFactory: (config: ConfigService, resendService: ResendEmailService, consoleService: ConsoleEmailService) =>
        config.get<string>("RESEND_API_KEY") ? resendService : consoleService,
      inject: [ConfigService, ResendEmailService, ConsoleEmailService],
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
