"use client";

import Link from "next/link";
import { EquipmentListingDto, EQUIPMENT_TYPES } from "@bau360/shared";
import { FavoriteButton } from "@/components/favorite-button";
import { ListingThumbnail } from "@/components/listing-thumbnail";
import { VerifiedBadge } from "@/components/verified-badge";
import { useLocale } from "@/lib/i18n/locale-context";

function equipmentLabel(value: string) {
  return EQUIPMENT_TYPES.find((e) => e.value === value)?.label ?? value;
}

export function EquipmentCard({ listing }: { listing: EquipmentListingDto }) {
  const { t } = useLocale();
  return (
    <Link
      href={`/equipment/${listing.id}`}
      className="block rounded-lg border border-ink-800 bg-ink-900 p-4 transition hover:border-gold-500"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ListingThumbnail photoUrl={listing.photoUrl} icon="🏗️" />
          <div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                listing.listingType === "SALE" ? "bg-gold-500/15 text-gold-400" : "bg-ink-800 text-silver-400"
              }`}
            >
              {t(`enums.equipmentListingType.${listing.listingType}`)}
            </span>
            <h3 className="mt-1 font-medium text-silver-200">
              {equipmentLabel(listing.equipmentType)}
              {listing.capacity ? ` · ${listing.capacity}` : ""}
            </h3>
            <p className="flex items-center gap-1 text-sm text-silver-500">
              {listing.ownerName}
              {listing.ownerVerified && <VerifiedBadge />}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">{listing.city}</span>
          <FavoriteButton listingType="EQUIPMENT" listingId={listing.id} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-silver-500">
        {listing.listingType === "SALE" ? (
          listing.salePrice && <span>{listing.salePrice.toLocaleString("tr-TR")} ₺</span>
        ) : (
          <>
            {listing.dailyRate && <span>{listing.dailyRate} ₺/gün</span>}
            {listing.hourlyRate && <span>{listing.hourlyRate} ₺/saat</span>}
          </>
        )}
      </div>
    </Link>
  );
}
