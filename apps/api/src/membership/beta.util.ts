import { ConfigService } from "@nestjs/config";

/**
 * imeceburada.com Erken Erişim/Beta dönemi kontrolü — varsayılan olarak
 * AÇIK'tır (env değişkeni tanımlanmamışsa bile beta modundayız sayılır),
 * çünkü lansman öncesi/sırası tam ücretsiz erişim niyetlenen davranıştır.
 * Ücretli döneme geçerken sadece BETA_FREE_ACCESS=false ortam değişkenini
 * ayarlamak yeterli — kod değişikliği gerekmez.
 */
export function isBetaFreeAccess(config: ConfigService): boolean {
  const raw = config.get<string>("BETA_FREE_ACCESS");
  return raw === undefined || raw === "true" || raw === "1";
}
