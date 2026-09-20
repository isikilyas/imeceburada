"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EMPLOYMENT_TYPES, JobPostingDto, LISTING_INTENTS, PaginatedResult, TRADE_CATEGORIES } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { JobCard } from "@/components/job-card";
import { Field, selectClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { ListingsTabs } from "@/components/listings-tabs";
import { ListSkeleton } from "@/components/list-skeleton";
import { useLocale } from "@/lib/i18n/locale-context";
import { slugifyTurkish } from "@/lib/slug";

export default function JobsPage() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [listingType, setListingType] = useState(searchParams.get("listingType") ?? "");
  const [tradeCategory, setTradeCategory] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const params = new URLSearchParams();
  if (listingType) params.set("listingType", listingType);
  if (tradeCategory) params.set("tradeCategory", tradeCategory);
  if (city) params.set("city", city);
  if (district) params.set("district", district);
  if (employmentType) params.set("employmentType", employmentType);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", listingType, tradeCategory, city, district, employmentType],
    queryFn: () => apiFetch<PaginatedResult<JobPostingDto>>(`/jobs?${params.toString()}`),
  });

  return (
    <div>
      <ListingsTabs active="jobs" />
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.jobsHeading")}</h1>

      <div className="mb-6 space-y-4 rounded-lg border border-ink-800 bg-ink-900/50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("filters.listingType")}>
            <select value={listingType} onChange={(e) => setListingType(e.target.value)} className={selectClass}>
              <option value="">{t("filters.allListingTypes")}</option>
              {LISTING_INTENTS.map((l) => (
                <option key={l.value} value={l.value}>
                  {t(`enums.listingIntent.${l.value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("filters.employmentType")}>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={selectClass}>
              <option value="">{t("filters.allEmploymentTypes")}</option>
              {EMPLOYMENT_TYPES.map((t2) => (
                <option key={t2.value} value={t2.value}>
                  {t(`enums.employmentType.${t2.value}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>
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

      {isLoading && <ListSkeleton count={6} />}
      {!isLoading && data?.items.length === 0 && <p className="text-silver-500">{t("common.noResults")}</p>}

      <div className="space-y-3">
        {data?.items.map((job) => <JobCard key={job.id} job={job} />)}
      </div>

      {data && data.items.length > 0 && (
        <RelatedSearches jobs={data.items} />
      )}
    </div>
  );
}

/** Yüklenen ilanlardaki şehir+meslek kombinasyonlarından, o kombinasyona özel SEO iniş sayfasına linkler üretir. */
function RelatedSearches({ jobs }: { jobs: JobPostingDto[] }) {
  const { t } = useLocale();
  const seen = new Set<string>();
  const links: { city: string; tradeLabel: string; href: string }[] = [];
  for (const job of jobs) {
    const key = `${job.city}::${job.tradeCategory}`;
    if (seen.has(key) || links.length >= 8) continue;
    seen.add(key);
    const tradeLabel = TRADE_CATEGORIES.find((t) => t.value === job.tradeCategory)?.label ?? job.tradeCategory;
    links.push({
      city: job.city,
      tradeLabel,
      href: `/is-ilanlari/${slugifyTurkish(job.city)}/${slugifyTurkish(job.tradeCategory)}`,
    });
  }
  if (links.length === 0) return null;

  return (
    <div className="mt-8 border-t border-ink-800 pt-6">
      <p className="mb-2 text-sm font-medium text-silver-300">{t("pages.relatedSearchesHeading")}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-ink-700 px-3 py-1 text-xs text-silver-400 hover:border-gold-500 hover:text-gold-400"
          >
            {l.city} {l.tradeLabel}
          </Link>
        ))}
      </div>
    </div>
  );
}