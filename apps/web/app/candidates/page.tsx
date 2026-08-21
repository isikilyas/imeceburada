"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CandidateDirectoryEntryDto, PaginatedResult, TRADE_CATEGORIES, WORK_PREFERENCES } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { Avatar } from "@/components/avatar";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CandidateDirectoryPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const [tradeCategory, setTradeCategory] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const params = new URLSearchParams();
  if (tradeCategory) params.set("tradeCategory", tradeCategory);
  if (city) params.set("city", city);
  if (district) params.set("district", district);

  const { data, isLoading, error } = useQuery({
    queryKey: ["candidates", tradeCategory, city, district],
    queryFn: () => authFetch<PaginatedResult<CandidateDirectoryEntryDto>>(`/candidates?${params.toString()}`),
    enabled: user?.role === "COMPANY",
  });

  if (authLoading) return <p className="text-silver-500">Yükleniyor...</p>;
  if (user?.role !== "COMPANY") {
    return <p className="text-silver-500">Usta dizini yalnızca firma hesapları içindir.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.candidatesHeading")}</h1>

      <div className="mb-6 space-y-3">
        <TradeCategorySelect value={tradeCategory} onChange={setTradeCategory} allowEmpty />
        <ProvinceDistrictSelect
          city={city}
          district={district}
          onCityChange={setCity}
          onDistrictChange={setDistrict}
          allowEmptyCity
          allowEmptyDistrict
        />
      </div>

      {isLoading && <p className="text-silver-500">Yükleniyor...</p>}
      {error && (
        <p className="text-sm text-red-400">
          {(error as Error).message ?? "Bu sayfayı görmek için aktif üyeliğin olmalı."}
        </p>
      )}
      {!isLoading && data?.items.length === 0 && <p className="text-silver-500">Sonuç bulunamadı.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.items.map((c) => (
          <Link
            key={c.id}
            href={`/candidates/${c.id}`}
            className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar photoUrl={c.photoUrl} size={40} />
                <p className="font-medium text-silver-200">{c.fullName}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  c.availabilityStatus === "AVAILABLE"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-ink-800 text-silver-500"
                }`}
              >
                {c.availabilityStatus === "AVAILABLE" ? "🟢 Müsait" : "🔴 Çalışıyor"}
              </span>
            </div>
            <p className="text-sm text-silver-500">
              {c.city}
              {c.district ? ` / ${c.district}` : ""} · {c.experienceYears} yıl deneyim
            </p>
            <p className="mt-2 text-xs text-gold-400">
              {TRADE_CATEGORIES.find((t) => t.value === c.primaryTradeCategory)?.label ?? c.primaryTradeCategory}
            </p>
            {c.workPreferences.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.workPreferences.map((v) => (
                  <span key={v} className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-silver-400">
                    {WORK_PREFERENCES.find((w) => w.value === v)?.label ?? v}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}