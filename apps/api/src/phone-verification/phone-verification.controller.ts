import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { PhoneVerificationService } from "./phone-verification.service";
import { SendCodeDto } from "./dto/send-code.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COMPANY", "SUPPLIER", "SUBCONTRACTOR")
@Controller("companies/me/phone")
export class PhoneVerificationController {
  constructor(private phoneVerificationService: PhoneVerificationService) {}

  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  @Post("send-code")
  sendCode(@CurrentUser() user: RequestUser, @Body() dto: SendCodeDto) {
    return this.phoneVerificationService.sendCode(user, dto.phone);
  }

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post("verify")
  verify(@CurrentUser() user: RequestUser, @Body() dto: VerifyCodeDto) {
    return this.phoneVerificationService.verifyCode(user, dto.code);
  }
}