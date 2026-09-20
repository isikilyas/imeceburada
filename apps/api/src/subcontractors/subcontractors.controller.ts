import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SubcontractorsService } from "./subcontractors.service";
import { SearchSubcontractorsDto } from "./dto/search-subcontractors.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { MembershipGuard } from "../membership/guards/membership.guard";

@Controller("subcontractors")
export class SubcontractorsController {
  constructor(private subcontractorsService: SubcontractorsService) {}

  /** Misafirler dahil herkese açık — sadece liste/özet alanları döner, telefon içermez. */
  @Get()
  search(@Query() query: SearchSubcontractorsDto) {
    return this.subcontractorsService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, MembershipGuard)
  @Roles("COMPANY")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.subcontractorsService.findOne(id);
  }
}