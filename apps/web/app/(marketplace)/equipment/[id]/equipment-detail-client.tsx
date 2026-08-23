"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { EquipmentListingDto, EQUIPMENT_TYPES } from "@imeceburada/shared";
import { apiFetch, API_ORIGIN } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { WhatsAppContactButton } from "@/components/whatsapp-contact-button";
import { VerifiedBadge } from "@/components/verified-badge";
import { DetailSkeleton } from "@/components/detail-skeleton";
import { maskPhone } from "@/lib/phone";

export function EquipmentDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLocale();

  const {
    data: listing,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => apiFetch<EquipmentListingDto>(`/equipment/${id}`),
  });

  if (isLoading) return <DetailSkeleton />;
  if (isError)
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-center">
        <p className="text-silver-300">İlan yüklenirken bir sorun oluştu.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 rounded-md border border-ink-700 px-4 py-2 text-sm text-silver-300 hover:border-gold-500 hover:text-gold-400"
        >
          Tekrar Dene
        </button>
      </div>
    );
  if (!listing) return <p className="text-silver-500">İlan bulunamadı.</p>;

  const label = EQUIPMENT_TYPES.find((e) => e.value === listing.equipmentType)?.label ?? listing.equipmentType;

  return (
    <div className="mx-auto max-w-2xl">
      {listing.photoUrl && (
        <div className="mb-5 overflow-hidden rounded-xl bg-ink-900">
          <Image
            src={`${API_ORIGIN}${listing.photoUrl}`}
            alt={label}
            width={800}
            height={450}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              listing.listingType === "SALE" ? "bg-gold-500/15 text-gold-400" : "bg-ink-800 text-silver-400"
            }`}
          >
            {t(`enums.equipmentListingType.${listing.listingType}`)}
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-silver-200">
            {label}
            {listing.capacity ? ` · ${listing.capacity}` : ""}
          </h1>
        </div>
        <WhatsAppShareButton
          text={`🏗️ ${label} — ${listing.city}\nİmece Burada'da incele:`}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-green-500 hover:text-green-400"
        />
      </div>
      <p className="mt-1 flex items-center gap-1 text-silver-500">
        {listing.ownerName}
        {listing.ownerVerified && <VerifiedBadge />}
        <span>· {listing.city}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-silver-500">
        {listing.listingType === "SALE" ? (
          listing.salePrice && <span className="text-lg font-medium text-gold-400">{listing.salePrice.toLocaleString("tr-TR")} ₺</span>
        ) : (
          <>
            {listing.dailyRate && <span>{listing.dailyRate} ₺/gün</span>}
            {listing.hourlyRate && <span>{listing.hourlyRate} ₺/saat</span>}
          </>
        )}
      </div>

      <p className="mt-6 whitespace-pre-wrap text-silver-300">{listing.description}</p>

      {listing.ownerPhone ? (
        <div className="mt-8 rounded-lg border border-gold-500/40 bg-ink-900 p-4">
          <p className="text-sm text-silver-500">İletişim</p>
          <p className="mt-1 text-lg font-medium text-gold-400">{maskPhone(listing.ownerPhone)}</p>
          <div className="mt-3">
            <WhatsAppContactButton
              phone={listing.ownerPhone}
              message={`Merhaba, platformunuzdaki ${label} ilanınızı gördüm. ${
                listing.listingType === "SALE" ? "Satın almak için" : "Kiralama için"
              } müsait misiniz?`}
            />
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-silver-500">
          İlan sahibi iletişim numarası paylaşmamış — şimdilik site dışından ulaşman gerekebilir.
        </p>
      )}
    </div>
  );
}
