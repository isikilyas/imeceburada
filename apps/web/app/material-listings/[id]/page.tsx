"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MATERIAL_TYPES, MaterialListingDto } from "@bau360/shared";
import { apiFetch } from "@/lib/api-client";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { WhatsAppContactButton } from "@/components/whatsapp-contact-button";
import { maskPhone } from "@/lib/phone";

export default function MaterialListingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["material-listing", id],
    queryFn: () => apiFetch<MaterialListingDto>(`/material-listings/${id}`),
  });

  if (isLoading) return <p className="text-silver-500">Yükleniyor...</p>;
  if (!listing) return <p className="text-silver-500">İlan bulunamadı.</p>;

  const label = MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-silver-200">{label}</h1>
        <WhatsAppShareButton
          text={`🧱 ${label} — ${listing.city}\nİmece Yapı'da incele:`}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-green-500 hover:text-green-400"
        />
      </div>
      <p className="mt-1 text-silver-500">
        {listing.supplierName} · {listing.city}
      </p>
      <p className="mt-4 text-xl font-medium text-gold-400">
        {listing.price} ₺/{listing.unit}
      </p>
      <p className="mt-6 whitespace-pre-wrap text-silver-300">{listing.description}</p>
      {listing.supplierPhone ? (
        <div className="mt-8 rounded-lg border border-gold-500/40 bg-ink-900 p-4">
          <p className="text-sm text-silver-500">İletişim</p>
          <p className="mt-1 text-lg font-medium text-gold-400">{maskPhone(listing.supplierPhone)}</p>
          <div className="mt-3">
            <WhatsAppContactButton
              phone={listing.supplierPhone}
              message={`Merhaba, platformunuzdaki ${label} ilanınızı gördüm. Sipariş için müsait misiniz?`}
            />
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-silver-500">
          Tedarikçi iletişim numarası paylaşmamış — şimdilik site dışından ulaşman gerekebilir.
        </p>
      )}
    </div>
  );
}