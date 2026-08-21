import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { MaterialIndexService } from "./material-index.service";
import { CreateMaterialSubmissionDto } from "./dto/create-material-submission.dto";
import { MaterialIndexQueryDto } from "./dto/material-index-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard)
@Controller("material-index")
export class MaterialIndexController {
  constructor(private materialIndexService: MaterialIndexService) {}

  @Get()
  getIndex(@Query() query: MaterialIndexQueryDto) {
    return this.materialIndexService.getIndex(query);
  }

  @Post()
  submit(@CurrentUser() user: RequestUser, @Body() dto: CreateMaterialSubmissionDto) {
    return this.materialIndexService.submit(user, dto);
  }
}
