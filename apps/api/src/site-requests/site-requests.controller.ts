import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { SiteRequestsService } from "./site-requests.service";
import { CreateSiteRequestDto } from "./dto/create-site-request.dto";
import { UpdateSiteRequestDto } from "./dto/update-site-request.dto";
import { SearchSiteRequestsDto } from "./dto/search-site-requests.dto";
import { CreateSiteRequestResponseDto } from "./dto/create-site-request-response.dto";
import { UpdateSiteRequestResponseDto } from "./dto/update-site-request-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@Controller("site-requests")
export class SiteRequestsController {
  constructor(private siteRequestsService: SiteRequestsService) {}

  @Get()
  search(@Query() query: SearchSiteRequestsDto) {
    return this.siteRequestsService.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get("mine")
  findMine(@CurrentUser() user: RequestUser) {
    return this.siteRequestsService.findMine(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.siteRequestsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateSiteRequestDto) {
    return this.siteRequestsService.create(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateSiteRequestDto) {
    return this.siteRequestsService.update(user, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/responses")
  respond(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: CreateSiteRequestResponseDto,
  ) {
    return this.siteRequestsService.respond(user, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/responses")
  listResponses(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.siteRequestsService.listResponses(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("responses/:responseId")
  updateResponseStatus(
    @CurrentUser() user: RequestUser,
    @Param("responseId") responseId: string,
    @Body() dto: UpdateSiteRequestResponseDto,
  ) {
    return this.siteRequestsService.updateResponseStatus(user, responseId, dto);
  }
}
