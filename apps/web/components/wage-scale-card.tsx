"use client";

import { useQuery } from "@tanstack/react-query";
import { TRADE_CATEGORIES, WAGE_PERIODS, WageScalePoint } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";

interface WageScaleCardProps {
  tradeCategory: string;
  city: string;
  district?: string | null;
}

export function WageScaleCard({ tradeCategory, city, district }: WageScaleCardProps) {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const params = new URLSearchParams({ tradeCategory, city });
  if (district) params.set("district", district);

  const { data, isLoading } = useQuery({
    queryKey: ["wage-scale", tradeCategory, city, district],
    queryFn: () => authFetch<WageScalePoint[]>(`/wage-index/scale?${params.toString()}`),
  });

  const tradeLabel = TRADE_CATEGORIES.find((t) => t.value === tradeCategory)?.label ?? tradeCategory;
  const locationLabel = district ? `${city} / ${district}` : city;

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h3 className="text-sm font-medium text-silver-300">{t("components.wageScaleCard.title")}</h3>
      <p className="mt-0.5 text-xs text-silver-500">
        {tradeLabel} · {locationLabel}
      </p>

      {isLoading && <p className="mt-3 text-sm text-silver-500">{t("common.loading")}</p>}

      {!isLoading && data?.length === 0 && (
        <p className="mt-3 text-sm text-silver-500">{t("components.wageScaleCard.noData")}</p>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="mt-3 space-y-3">
          {data.map((point) => (
            <div key={point.period} className="rounded-md bg-ink-800 p-3">
              <p className="mb-2 text-xs text-silver-500">
                {WAGE_PERIODS.find((p) => p.value === point.period)?.label ?? point.period} ·{" "}
                {t("components.wageScaleCard.sampleCount", { count: point.sampleSize })}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-silver-500">{t("components.wageScaleCard.min")}</p>
                  <p className="font-medium text-silver-300">{point.minAmount.toLocaleString("tr-TR")} ₺</p>
                </div>
                <div>
                  <p className="text-xs text-silver-500">{t("components.wageScaleCard.average")}</p>
                  <p className="font-semibold text-gold-400">{point.averageAmount.toLocaleString("tr-TR")} ₺</p>
                </div>
                <div>
                  <p className="text-xs text-silver-500">{t("components.wageScaleCard.max")}</p>
                  <p className="font-medium text-silver-300">{point.maxAmount.toLocaleString("tr-TR")} ₺</p>
                </div>
              </div>
              {point.expectationAverage !== null && (
                <p className="mt-2 border-t border-ink-700 pt-2 text-center text-xs text-emerald-400">
                  {t("components.wageScaleCard.marketExpectation", {
                    amount: `${point.expectationAverage.toLocaleString("tr-TR")} ₺`,
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}