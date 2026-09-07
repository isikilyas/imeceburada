import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { TaxonomyService } from "./taxonomy.service";
import { ListTaxonomyTermsQueryDto } from "./dto/list-taxonomy-terms-query.dto";
import { ApproveTaxonomyTermDto } from "./dto/approve-taxonomy-term.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/taxonomy-terms")
export class AdminTaxonomyController {
  constructor(private taxonomyService: TaxonomyService) {}

  @Get()
  list(@Query() query: ListTaxonomyTermsQueryDto) {
    return this.taxonomyService.listTerms(query.status, query.type);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: ApproveTaxonomyTermDto) {
    return this.taxonomyService.approveTerm(id, user.id, dto.label);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.taxonomyService.rejectTerm(id, user.id);
  }
}
