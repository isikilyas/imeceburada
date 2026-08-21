import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConsoleEmailService, EMAIL_SERVICE } from "./email.service";

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, { provide: EMAIL_SERVICE, useClass: ConsoleEmailService }],
  exports: [AuthService],
})
export class AuthModule {}
