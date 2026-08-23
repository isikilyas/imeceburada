"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MATERIAL_TYPES, MaterialListingDto, PaginatedResult } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import { Field, selectClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";

export function SupplierSpotlight() {
  const { t } = useLocale();
  const [materialType, setMaterialType] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const params = new URLSearchParams({ pageSize: "6" });
  if (materialType) params.set("materialType", materialType);
  if (city) params.set("city", city);
  if (district) params.set("district", district);

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-spotlight", materialType, city, district],
    queryFn: () => apiFetch<PaginatedResult<MaterialListingDto>>(`/material-listings?${params.toString()}`),
  });

  const listings = data?.items ?? [];
  const isFiltered = !!(materialType || city || district);
  if (!isFiltered && !isLoading && listings.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-silver-200 sm:text-3xl">{t("home.supplierSpotlightHeading")}</h2>
          <p className="mt-1 text-sm text-silver-500">{t("home.supplierSpotlightSubheading")}</p>
        </div>
        <Link href="/material-listings" className="shrink-0 text-sm text-gold-400 hover:underline">
          {t("home.supplierSpotlightViewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label={t("filters.material")}>
          <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className={selectClass}>
            <option value="">{t("filters.allMaterials")}</option>
            {MATERIAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {t(`enums.materialType.${m.value}`)}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <ProvinceDistrictSelect
            city={city}
            district={district}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
            allowEmptyCity
            allowEmptyDistrict
          />
        </div>
      </div>

      {!isLoading && listings.length === 0 && <p className="text-sm text-silver-500">{t("common.noResults")}</p>}

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {listings.map((listing) => {
          const label = MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType;
          return (
            <Link
              key={listing.id}
              href={`/material-listings/${listing.id}`}
              className="w-56 shrink-0 rounded-xl bg-ink-900 p-4 transition hover:bg-ink-800"
            >
              <p className="text-xs text-silver-500">{listing.supplierName}</p>
              <h3 className="mt-1 font-medium text-silver-200">{label}</h3>
              <p className="mt-1 text-xs text-silver-500">
                {listing.city}
                {listing.district ? ` / ${listing.district}` : ""}
              </p>
              <p className="mt-3 font-medium text-gold-400">
                {listing.price} ₺/{listing.unit}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}