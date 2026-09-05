import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { RegisterCompanyDto } from "./dto/register-company.dto";
import { RegisterSupplierDto } from "./dto/register-supplier.dto";
import { RegisterSubcontractorDto } from "./dto/register-subcontractor.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RequestPhoneLoginDto } from "./dto/request-phone-login.dto";
import { VerifyPhoneLoginDto } from "./dto/verify-phone-login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RequestUser } from "./types/request-user";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register/candidate")
  registerCandidate(@Body() dto: RegisterCandidateDto) {
    return this.authService.registerCandidate(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register/company")
  registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.authService.registerCompany(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register/supplier")
  registerSupplier(@Body() dto: RegisterSupplierDto) {
    return this.authService.registerSupplier(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register/subcontractor")
  registerSubcontractor(@Body() dto: RegisterSubcontractorDto) {
    return this.authService.registerSubcontractor(dto);
  }

  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("login/phone/request")
  requestPhoneLogin(@Body() dto: RequestPhoneLoginDto) {
    return this.authService.requestPhoneLogin(dto);
  }

  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post("login/phone/verify")
  verifyPhoneLogin(@Body() dto: VerifyPhoneLoginDto) {
    return this.authService.verifyPhoneLogin(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
