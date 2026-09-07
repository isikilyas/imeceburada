import { Controller, Get, Query } from "@nestjs/common";
import { TaxonomyService } from "./taxonomy.service";
import { SuggestTaxonomyQueryDto } from "./dto/suggest-taxonomy-query.dto";
import { CompanyNameSuggestQueryDto } from "./dto/company-name-suggest-query.dto";

/**
 * Bilerek herkese açık (JWT gerekmez) — bu uçlar kayıt formunda (henüz token
 * yokken) da, oturum açmış kullanıcıların ilan/gönderim formlarında da
 * kullanılır. Salt okunur ve hassas veri döndürmez.
 */
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
