"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TRADE_CATEGORIES, WageHomepageSummaryResponse } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

/**
 * Personel/iş sayfalarının üstünde, o an bakılan kategoriyle ilgili canlı
 * ücret endeksini küçük bir rozet olarak gösterir — ana sayfadaki
 * WageSummaryWidget ile aynı genel veriyi kullanır, sadece kompakt.
 */
export function LiveWageBadge() {
  const { t } = useLocale();
  const { data } = useQuery({
    queryKey: ["wage-homepage-summary", "national"],
    queryFn: () => apiFetch<WageHomepageSummaryResponse>("/wage-index/homepage-summary"),
    staleTime: 10 * 60 * 1000,
  });

  const item = data?.items[0];
  if (!item) return null;

  const label = TRADE_CATEGORIES.find((tc) => tc.value === item.tradeCategory)?.label ?? item.tradeCategory;

  return (
    <Link
      href="/wage-index"
      className="group inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/5 px-3 py-1.5 text-xs transition hover:border-gold-500/60 hover:bg-gold-500/10"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
      </span>
      <span className="text-silver-500">{t("components.liveWageBadge.label")}</span>
      <span className="font-semibold text-gold-400">
        {label}: {item.averageAmount.toLocaleString("tr-TR")} ₺
      </span>
    </Link>
  );
}
