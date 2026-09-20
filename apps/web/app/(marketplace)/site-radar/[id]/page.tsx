import type { Metadata } from "next";
import { EQUIPMENT_TYPES, SiteRequestDto, TRADE_CATEGORIES } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { SiteRequestDetailClient } from "./site-request-detail-client";

async function getSiteRequest(id: string): Promise<SiteRequestDto | null> {
  try {
    return await apiFetch<SiteRequestDto>(`/site-requests/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const request = await getSiteRequest(params.id);
  if (!request) return { title: "Talep Bulunamadı — İmece Pazaryeri" };

  const kindLabel =
    request.requestType === "WORKER"
      ? (TRADE_CATEGORIES.find((t) => t.value === request.tradeCategory)?.label ?? "Personel")
      : (EQUIPMENT_TYPES.find((e) => e.value === request.equipmentType)?.label ?? "Ekipman");

  const title = `${request.title} — ${kindLabel} Aranıyor, ${request.city} | İmece Pazaryeri`;
  const description = request.description
    ? request.description.slice(0, 160)
    : `${kindLabel} talebi — ${request.city}. Şantiye Radarı'nda incele.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function SiteRequestDetailPage() {
  return <SiteRequestDetailClient />;
}
