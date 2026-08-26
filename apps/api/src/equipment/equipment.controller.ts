import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { EquipmentService } from "./equipment.service";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";
import { SearchEquipmentDto } from "./dto/search-equipment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";
import { photoUploadOptions, finalizeUploadedImage } from "../common/photo-upload.util";

@Controller("equipment")
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @Get()
  search(@Query() query: SearchEquipmentDto) {
    return this.equipmentService.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get("mine")
  findMine(@CurrentUser() user: RequestUser) {
    return this.equipmentService.findMine(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.equipmentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(user, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.equipmentService.remove(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/photo")
  @UseInterceptors(FileInterceptor("photo", photoUploadOptions("equipment")))
  uploadPhoto(@CurrentUser() user: RequestUser, @Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Dosya bulunamadı");
    return this.equipmentService.setPhoto(user, id, finalizeUploadedImage(file));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/photo")
  removePhoto(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.equipmentService.removePhoto(user, id);
  }
}
