import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { TaxonomyService } from "./taxonomy.service";
import { SuggestTaxonomyQueryDto } from "./dto/suggest-taxonomy-query.dto";
import { CompanyNameSuggestQueryDto } from "./dto/company-name-suggest-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("taxonomy")
export class TaxonomyController {
  constructor(private taxonomyService: TaxonomyService) {}

  @Get("suggest")
  suggest(@Query() query: SuggestTaxonomyQueryDto) {
    return this.taxonomyService.suggest(query.type, query.q);
  }

  @Get("company-name-suggestions")
  companyNameSuggestions(@Query() query: CompanyNameSuggestQueryDto) {
    return this.taxonomyService.findSimilarCompanyNames(query.name);
  }
}
