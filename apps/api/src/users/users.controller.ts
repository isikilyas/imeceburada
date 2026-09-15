import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";
import { UpdateCandidateProfileDto } from "./dto/update-candidate-profile.dto";
import { UpdateCompanyProfileDto } from "./dto/update-company-profile.dto";
import { UpdateSubcontractorProfileDto } from "./dto/update-subcontractor-profile.dto";
import { UpdateSupplierProfileDto } from "./dto/update-supplier-profile.dto";
import { UpdateAdminProfileDto } from "./dto/update-admin-profile.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { DeactivateAccountDto } from "./dto/deactivate-account.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RequestEmailChangeDto } from "./dto/request-email-change.dto";
import { ConfirmEmailChangeDto } from "./dto/confirm-email-change.dto";
import { UpdateUsernameDto } from "./dto/update-username.dto";
import { photoUploadOptions, finalizeUploadedImage } from "../common/photo-upload.util";

@UseGuards(JwtAuthGuard)
@Controller("users/me")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  getMyProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.getMyProfile(user);
  }

  @Patch("profile/candidate")
  updateCandidateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateCandidateProfileDto) {
    return this.usersService.updateCandidateProfile(user, dto);
  }

  @Patch("profile/company")
  updateCompanyProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateCompanyProfileDto) {
    return this.usersService.updateCompanyProfile(user, dto);
  }

  @Patch("profile/subcontractor")
  updateSubcontractorProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateSubcontractorProfileDto) {
    return this.usersService.updateSubcontractorProfile(user, dto);
  }

  @Patch("profile/supplier")
  updateSupplierProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateSupplierProfileDto) {
    return this.usersService.updateSupplierProfile(user, dto);
  }

  @Patch("profile/admin")
  updateAdminProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateAdminProfileDto) {
    return this.usersService.updateAdminProfile(user, dto);
  }

  @Post("candidate-photo")
  @UseInterceptors(FileInterceptor("photo", photoUploadOptions("candidates")))
  uploadCandidatePhoto(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Dosya bulunamadı");
    return this.usersService.setCandidatePhoto(user, finalizeUploadedImage(file));
  }

  @Delete("candidate-photo")
  removeCandidatePhoto(@CurrentUser() user: RequestUser) {
    return this.usersService.removeCandidatePhoto(user);
  }

  @Post("company-logo")
  @UseInterceptors(FileInterceptor("logo", photoUploadOptions("company-logos")))
  uploadCompanyLogo(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Dosya bulunamadı");
    return this.usersService.setCompanyLogo(user, finalizeUploadedImage(file));
  }

  @Delete("company-logo")
  removeCompanyLogo(@CurrentUser() user: RequestUser) {
    return this.usersService.removeCompanyLogo(user);
  }

  @Post("admin-photo")
  @UseInterceptors(FileInterceptor("photo", photoUploadOptions("admins")))
  uploadAdminPhoto(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Dosya bulunamadı");
    return this.usersService.setAdminPhoto(user, finalizeUploadedImage(file));
  }

  @Delete("admin-photo")
  removeAdminPhoto(@CurrentUser() user: RequestUser) {
    return this.usersService.removeAdminPhoto(user);
  }

  @Patch("username")
  updateUsername(@CurrentUser() user: RequestUser, @Body() dto: UpdateUsernameDto) {
    return this.usersService.updateUsername(user, dto.username ?? null);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Patch("password")
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("email/request-change")
  requestEmailChange(@CurrentUser() user: RequestUser, @Body() dto: RequestEmailChangeDto) {
    return this.usersService.requestEmailChange(user, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("email/confirm-change")
  confirmEmailChange(@CurrentUser() user: RequestUser, @Body() dto: ConfirmEmailChangeDto) {
    return this.usersService.confirmEmailChange(user, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("logout-all")
  logoutAllDevices(@CurrentUser() user: RequestUser) {
    return this.usersService.logoutAllDevices(user);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("deactivate")
  deactivateAccount(@CurrentUser() user: RequestUser, @Body() dto: DeactivateAccountDto) {
    return this.usersService.deactivateAccount(user, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Delete()
  deleteAccount(@CurrentUser() user: RequestUser, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteMyAccount(user, dto);
  }
}
