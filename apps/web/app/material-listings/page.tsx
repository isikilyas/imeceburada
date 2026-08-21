"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MATERIAL_TYPES, MaterialListingDto, PaginatedResult } from "@bau360/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Field, selectClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { ListingsTabs } from "@/components/listings-tabs";
import { FavoriteButton } from "@/components/favorite-button";
import { useLocale } from "@/lib/i18n/locale-context";

export default function MaterialListingsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [materialType, setMaterialType] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const params = new URLSearchParams();
  if (materialType) params.set("materialType", materialType);
  if (city) params.set("city", city);
  if (district) params.set("district", district);

  const { data, isLoading } = useQuery({
    queryKey: ["material-listings", materialType, city, district],
    queryFn: () => apiFetch<PaginatedResult<MaterialListingDto>>(`/material-listings?${params.toString()}`),
  });

  return (
    <div>
      <ListingsTabs active="materials" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-silver-300">{t("pages.materialListingsHeading")}</h1>
        {user?.role === "SUPPLIER" && (
          <Link
            href="/dashboard/supplier"
            className="rounded-md bg-gold-500 px-3 py-1.5 text-sm font-medium text-ink-950 hover:bg-gold-400"
          >
            İlan Ver
          </Link>
        )}
      </div>

      <div className="mb-6 space-y-4 rounded-lg border border-ink-800 bg-ink-900/50 p-4">
        <Field label="Malzeme">
          <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className={selectClass}>
            <option value="">Tüm Malzemeler</option>
            {MATERIAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <ProvinceDistrictSelect
          city={city}
          district={district}
          onCityChange={setCity}
          onDistrictChange={setDistrict}
          allowEmptyCity
          allowEmptyDistrict
        />
      </div>

      {isLoading && <p className="text-silver-500">{t("common.loading")}</p>}
      {!isLoading && data?.items.length === 0 && <p className="text-silver-500">{t("common.noResults")}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.items.map((listing) => (
          <Link
            key={listing.id}
            href={`/material-listings/${listing.id}`}
            className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-silver-200">
                  {MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType}
                </h3>
                <p className="text-sm text-silver-500">{listing.supplierName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">
                  {listing.city}
                  {listing.district ? ` / ${listing.district}` : ""}
                </span>
                <FavoriteButton listingType="MATERIAL_LISTING" listingId={listing.id} />
              </div>
            </div>
            <p className="mt-3 text-sm text-gold-400">
              {listing.price} ₺/{listing.unit}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}