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
    // Telefonla giriş kodu için de gerçek bir SMS sağlayıcısı seçilene kadar
    // phone-verification modülüyle aynı geçici (sadece loglayan) uygulama.
    { provide: SMS_SERVICE, useClass: ConsoleSmsService },
  ],
  exports: [AuthService],
})
export class AuthModule {}
