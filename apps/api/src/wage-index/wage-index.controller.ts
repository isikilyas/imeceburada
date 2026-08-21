import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { WageIndexService } from "./wage-index.service";
import { CreateWageSubmissionDto } from "./dto/create-wage-submission.dto";
import { WageIndexQueryDto } from "./dto/wage-index-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard)
@Controller("wage-index")
export class WageIndexController {
  constructor(private wageIndexService: WageIndexService) {}

  @Get()
  getIndex(@Query() query: WageIndexQueryDto) {
    return this.wageIndexService.getIndex(query);
  }

  @Get("scale")
  getScale(@Query() query: WageIndexQueryDto) {
    return this.wageIndexService.getScale(query);
  }

  @Post()
  submit(@CurrentUser() user: RequestUser, @Body() dto: CreateWageSubmissionDto) {
    return this.wageIndexService.submit(user, dto);
  }
}
