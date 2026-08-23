"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EquipmentListingDto, EQUIPMENT_LISTING_TYPES, EquipmentListingType, PaginatedResult } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { EquipmentCard } from "@/components/equipment-card";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { EquipmentCategorySelect } from "@/components/equipment-category-select";
import { ListingsTabs } from "@/components/listings-tabs";
import { ListSkeleton } from "@/components/list-skeleton";
import { useLocale } from "@/lib/i18n/locale-context";

export default function EquipmentPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [equipmentType, setEquipmentType] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [listingType, setListingType] = useState<EquipmentListingType | "">("");

  const params = new URLSearchParams();
  if (equipmentType) params.set("equipmentType", equipmentType);
  if (city) params.set("city", city);
  if (district) params.set("district", district);
  if (listingType) params.set("listingType", listingType);

  const { data, isLoading } = useQuery({
    queryKey: ["equipment", equipmentType, city, district, listingType],
    queryFn: () => apiFetch<PaginatedResult<EquipmentListingDto>>(`/equipment?${params.toString()}`),
  });

  return (
    <div>
      <ListingsTabs active="equipment" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-silver-300">{t("pages.equipmentHeading")}</h1>
        {user && (
          <div className="flex gap-3 text-sm">
            <Link href="/equipment/mine" className="text-gold-400 hover:underline">
              {t("common.myListings")}
            </Link>
            <Link
              href="/equipment/new"
              className="rounded-md bg-gold-500 px-3 py-1.5 font-medium text-ink-950 hover:bg-gold-400"
            >
              {t("common.newListing")}
            </Link>
          </div>
        )}
      </div>

      <div className="mb-6 space-y-4 rounded-lg border border-ink-800 bg-ink-900/50 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setListingType("")}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              listingType === "" ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-ink-700 text-silver-300"
            }`}
          >
            {t("filters.all")}
          </button>
          {EQUIPMENT_LISTING_TYPES.map((lt) => (
            <button
              key={lt.value}
              type="button"
              onClick={() => setListingType(lt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                listingType === lt.value
                  ? "border-gold-500 bg-gold-500/10 text-gold-400"
                  : "border-ink-700 text-silver-300"
              }`}
            >
              {t(`enums.equipmentListingType.${lt.value}`)}
            </button>
          ))}
        </div>
        <EquipmentCategorySelect value={equipmentType} onChange={setEquipmentType} allowEmpty />
        <ProvinceDistrictSelect
          city={city}
          district={district}
          onCityChange={setCity}
          onDistrictChange={setDistrict}
          allowEmptyCity
          allowEmptyDistrict
        />
      </div>

      {isLoading && <ListSkeleton count={6} columns={2} />}
      {!isLoading && data?.items.length === 0 && <p className="text-silver-500">{t("common.noResults")}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.items.map((listing) => (
          <EquipmentCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}