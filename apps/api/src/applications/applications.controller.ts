import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Roles("CANDIDATE", "SUBCONTRACTOR")
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(user, dto);
  }

  @Roles("CANDIDATE", "SUBCONTRACTOR")
  @Get("mine")
  findMine(@CurrentUser() user: RequestUser) {
    return this.applicationsService.findMine(user);
  }

  @Roles("COMPANY")
  @Get("job/:jobId")
  findForJob(@CurrentUser() user: RequestUser, @Param("jobId") jobId: string) {
    return this.applicationsService.findForJob(user, jobId);
  }

  /** Aday veya ilanı açan firma erişebilir — mesajlaşma/yorum sayfaları başvuru durumunu bilmek için kullanır. */
  @Get(":id")
  findOne(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.applicationsService.findOne(user, id);
  }

  @Roles("COMPANY")
  @Patch(":id/status")
  updateStatus(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user, id, dto);
  }
}
