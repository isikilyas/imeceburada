import type { Metadata } from "next";
import { EquipmentListingDto, EQUIPMENT_TYPES } from "@bau360/shared";
import { apiFetch, API_ORIGIN } from "@/lib/api-client";
import { EquipmentDetailClient } from "./equipment-detail-client";

async function getListing(id: string): Promise<EquipmentListingDto | null> {
  try {
    return await apiFetch<EquipmentListingDto>(`/equipment/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "İlan Bulunamadı — İmece Pazaryeri" };

  const label = EQUIPMENT_TYPES.find((e) => e.value === listing.equipmentType)?.label ?? listing.equipmentType;
  const title = `${label} — ${listing.listingType === "SALE" ? "Satılık" : "Kiralık"} | İmece Pazaryeri`;
  const description = listing.description
    ? listing.description.slice(0, 160)
    : `${label} — ${listing.city}. İmece Pazaryeri'nde incele.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: listing.photoUrl ? [{ url: `${API_ORIGIN}${listing.photoUrl}` }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  const label = listing
    ? (EQUIPMENT_TYPES.find((e) => e.value === listing.equipmentType)?.label ?? listing.equipmentType)
    : "";

  return (
    <>
      {listing && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: label,
              description: listing.description,
              category: "Construction Equipment",
              offers: {
                "@type": "Offer",
                priceCurrency: "TRY",
                price: listing.salePrice ?? listing.dailyRate ?? listing.hourlyRate ?? undefined,
                availability: "https://schema.org/InStock",
                areaServed: listing.city,
              },
            }),
          }}
        />
      )}
      <EquipmentDetailClient />
    </>
  );
}
