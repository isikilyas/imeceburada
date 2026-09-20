"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TRADE_CATEGORIES, TURKISH_PROVINCES, WageHomepageSummaryResponse, stringSimilarity } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

const PROVINCE_MATCH_THRESHOLD = 0.6;
const SLIDE_INTERVAL_MS = 4500;

/** Tarayıcı konumundan dönen il adını (İngilizce/aksansız olabilir) bizim 81 il listemizle eşleştirir. */
function matchProvince(candidate: string): string | null {
  let best: { province: string; score: number } | null = null;
  for (const province of TURKISH_PROVINCES) {
    const score = stringSimilarity(candidate, province);
    if (!best || score > best.score) best = { province, score };
  }
  return best && best.score >= PROVINCE_MATCH_THRESHOLD ? best.province : null;
}

function useLocalProvince() {
  const [province, setProvince] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=tr`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const matched = matchProvince(data.principalSubdivision ?? "");
            if (matched) setProvince(matched);
          })
          .catch(() => undefined);
      },
      () => undefined,
      { timeout: 5000 },
    );
  }, []);

  return province;
}

function useWageSummary(city?: string) {
  return useQuery({
    queryKey: ["wage-homepage-summary", city ?? "national"],
    queryFn: () =>
      apiFetch<WageHomepageSummaryResponse>(`/wage-index/homepage-summary${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  });
}

function IndexSlideCard({ title, data }: { title: string; data: WageHomepageSummaryResponse }) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (data.items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % data.items.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [data.items.length]);

  const item = data.items[index];
  const label = TRADE_CATEGORIES.find((tc) => tc.value === item.tradeCategory)?.label ?? item.tradeCategory;

  return (
    <Link
      href="/wage-index"
      className="group flex flex-1 flex-col gap-2 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-950 px-5 py-4 ring-1 ring-ink-800 transition hover:-translate-y-0.5 hover:ring-gold-500/40"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-silver-500">{title}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium text-silver-300">{label}</span>
        <span className="shrink-0 text-lg font-bold text-gold-400">{item.averageAmount.toLocaleString("tr-TR")} ₺</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-silver-600">{t("components.wageSummaryWidget.sampleSizeNote", { count: item.sampleSize })}</span>
        {data.items.length > 1 && (
          <div className="flex gap-1">
            {data.items.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full transition ${i === index ? "bg-gold-400" : "bg-ink-700"}`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function WageSummaryWidget() {
  const { t } = useLocale();
  const localProvince = useLocalProvince();
  const national = useWageSummary();
  const local = useWageSummary(localProvince ?? undefined);

  const hasNational = !!national.data?.items.length;
  const hasLocal = !!localProvince && !!local.data?.items.length;

  if (!hasNational && !hasLocal) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row">
      {hasNational && <IndexSlideCard title={t("components.wageSummaryWidget.nationalTitle")} data={national.data!} />}
      {hasLocal && (
        <IndexSlideCard
          title={t("components.wageSummaryWidget.localTitle", { city: localProvince! })}
          data={local.data!}
        />
      )}
    </div>
  );
}
