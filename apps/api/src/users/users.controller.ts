import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";
import { UpdateCandidateProfileDto } from "./dto/update-candidate-profile.dto";
import { UpdateCompanyProfileDto } from "./dto/update-company-profile.dto";
import { UpdateSubcontractorProfileDto } from "./dto/update-subcontractor-profile.dto";
import { UpdateSupplierProfileDto } from "./dto/update-supplier-profile.dto";
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
}
