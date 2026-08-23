"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PaginatedResult, SubcontractorDirectoryEntryDto, TRADE_CATEGORIES } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { ListSkeleton } from "@/components/list-skeleton";
import { useLocale } from "@/lib/i18n/locale-context";

export default function SubcontractorDirectoryPage() {
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
    queryKey: ["subcontractors", tradeCategory, city, district],
    queryFn: () => authFetch<PaginatedResult<SubcontractorDirectoryEntryDto>>(`/subcontractors?${params.toString()}`),
    enabled: user?.role === "COMPANY",
  });

  if (authLoading) return <ListSkeleton count={4} columns={2} />;
  if (user?.role !== "COMPANY") {
    return <p className="text-silver-500">Taşeron firma dizini yalnızca firma hesapları içindir.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.subcontractorsHeading")}</h1>
      <p className="mb-6 text-sm text-silver-500">
        Faturalı iş yapan taşeron firmaları meslek ve bölgeye göre bul, doğrudan iletişime geç.
      </p>

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

      {isLoading && <ListSkeleton count={4} columns={2} />}
      {error && (
        <p className="text-sm text-red-400">
          {(error as Error).message ?? "Bu sayfayı görmek için aktif üyeliğin olmalı."}
        </p>
      )}
      {!isLoading && data?.items.length === 0 && <p className="text-silver-500">Sonuç bulunamadı.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.items.map((s) => (
          <Link
            key={s.id}
            href={`/subcontractors/${s.id}`}
            className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
          >
            <p className="font-medium text-silver-200">{s.companyName}</p>
            <p className="text-sm text-silver-500">
              {s.city}
              {s.district ? ` / ${s.district}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.tradeCategories.map((v) => (
                <span key={v} className="rounded-full bg-ink-800 px-2.5 py-0.5 text-xs text-gold-400">
                  {TRADE_CATEGORIES.find((t) => t.value === v)?.label ?? v}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}