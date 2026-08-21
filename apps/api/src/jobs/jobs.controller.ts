import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { SearchJobsDto } from "./dto/search-jobs.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";
import { MembershipGuard } from "../membership/guards/membership.guard";

@Controller("jobs")
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  search(@Query() query: SearchJobsDto) {
    return this.jobsService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("COMPANY")
  @Get("mine")
  findMine(@CurrentUser() user: RequestUser) {
    return this.jobsService.findMine(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, MembershipGuard)
  @Roles("COMPANY")
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("COMPANY")
  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(user, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("COMPANY")
  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.jobsService.remove(user, id);
  }
}
