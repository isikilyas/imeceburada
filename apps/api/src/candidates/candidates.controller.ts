import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { CandidatesService } from "./candidates.service";
import { SearchCandidatesDto } from "./dto/search-candidates.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { MembershipGuard } from "../membership/guards/membership.guard";

@UseGuards(JwtAuthGuard, RolesGuard, MembershipGuard)
@Roles("COMPANY")
@Controller("candidates")
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  search(@Query() query: SearchCandidatesDto) {
    return this.candidatesService.search(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.candidatesService.findOne(id);
  }
}