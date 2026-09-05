import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConsoleEmailService, EMAIL_SERVICE } from "./email.service";
import { ResendEmailService } from "./resend-email.service";
import { ConsoleSmsService, SMS_SERVICE } from "../phone-verification/sms.service";
import { NetgsmSmsService } from "../phone-verification/netgsm-sms.service";

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ResendEmailService,
    {
      // RESEND_API_KEY tanımlıysa gerçek e-posta gönderilir; yerel geliştirmede
      // olduğu gibi tanımlı değilse linki sadece loglayan sürüme düşer.
      provide: EMAIL_SERVICE,
      useFactory: (config: ConfigService, resendService: ResendEmailService, consoleService: ConsoleEmailService) =>
        config.get<string>("RESEND_API_KEY") ? resendService : consoleService,
      inject: [ConfigService, ResendEmailService, ConsoleEmailService],
    },
    ConsoleEmailService,
    NetgsmSmsService,
    ConsoleSmsService,
    {
      // NETGSM_USERCODE tanımlıysa gerçek SMS gönderilir; tanımlı değilse
      // kodu sadece loglayan sürüme düşer (phone-verification.module.ts ile aynı desen).
      provide: SMS_SERVICE,
      useFactory: (config: ConfigService, netgsm: NetgsmSmsService, console: ConsoleSmsService) =>
        config.get<string>("NETGSM_USERCODE") ? netgsm : console,
      inject: [ConfigService, NetgsmSmsService, ConsoleSmsService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
