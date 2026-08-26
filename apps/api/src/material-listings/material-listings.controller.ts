import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MaterialListingsService } from "./material-listings.service";
import { photoUploadOptions, finalizeUploadedImage } from "../common/photo-upload.util";
import { CreateMaterialListingDto } from "./dto/create-material-listing.dto";
import { UpdateMaterialListingDto } from "./dto/update-material-listing.dto";
import { SearchMaterialListingsDto } from "./dto/search-material-listings.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { MembershipGuard } from "../membership/guards/membership.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@Controller("material-listings")
export class MaterialListingsController {
  constructor(private materialListingsService: MaterialListingsService) {}

  @Get()
  search(@Query() query: SearchMaterialListingsDto) {
    return this.materialListingsService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPPLIER")
  @Get("mine")
  findMine(@CurrentUser() user: RequestUser) {
    return this.materialListingsService.findMine(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.materialListingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, MembershipGuard)
  @Roles("SUPPLIER")
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateMaterialListingDto) {
    return this.materialListingsService.create(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPPLIER")
  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateMaterialListingDto) {
    return this.materialListingsService.update(user, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPPLIER")
  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.materialListingsService.remove(user, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPPLIER")
  @Post(":id/photo")
  @UseInterceptors(FileInterceptor("photo", photoUploadOptions("materials")))
  uploadPhoto(@CurrentUser() user: RequestUser, @Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Dosya bulunamadı");
    return this.materialListingsService.setPhoto(user, id, finalizeUploadedImage(file));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPPLIER")
  @Delete(":id/photo")
  removePhoto(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.materialListingsService.removePhoto(user, id);
  }
}