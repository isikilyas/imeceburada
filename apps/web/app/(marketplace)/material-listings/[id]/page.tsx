import type { Metadata } from "next";
import { MATERIAL_TYPES, MaterialListingDto } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { MaterialListingDetailClient } from "./material-listing-detail-client";

async function getListing(id: string): Promise<MaterialListingDto | null> {
  try {
    return await apiFetch<MaterialListingDto>(`/material-listings/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "İlan Bulunamadı — İmece Pazaryeri" };

  const label = MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType;
  const title = `${label} — ${listing.city} | İmece Pazaryeri`;
  const description = listing.description
    ? listing.description.slice(0, 160)
    : `${label} — ${listing.price} ₺/${listing.unit}. İmece Pazaryeri'nde incele.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function MaterialListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  const label = listing ? (MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType) : "";

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
              category: "Construction Material",
              offers: {
                "@type": "Offer",
                priceCurrency: "TRY",
                price: listing.price,
                priceValidUntil: undefined,
                availability: "https://schema.org/InStock",
                areaServed: listing.city,
              },
            }),
          }}
        />
      )}
      <MaterialListingDetailClient />
    </>
  );
}
