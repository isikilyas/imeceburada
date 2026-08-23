"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EMPLOYMENT_TYPES, JobPostingDto, LISTING_INTENTS, PaginatedResult } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { JobCard } from "@/components/job-card";
import { Field, selectClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { ListingsTabs } from "@/components/listings-tabs";
import { ListSkeleton } from "@/components/list-skeleton";
import { useLocale } from "@/lib/i18n/locale-context";

export default function JobsPage() {
  const { t } = useLocale();
  const [listingType, setListingType] = useState("");
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
    </div>
  );
}