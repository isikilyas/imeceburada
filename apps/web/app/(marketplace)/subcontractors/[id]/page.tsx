"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SubcontractorDirectoryDetailDto, TRADE_CATEGORIES } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { WhatsAppContactButton } from "@/components/whatsapp-contact-button";
import { PhoneCallButton } from "@/components/phone-call-button";
import { DetailSkeleton } from "@/components/detail-skeleton";

export default function SubcontractorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const { t } = useLocale();

  const { data: subcontractor, isLoading, error } = useQuery({
    queryKey: ["subcontractor", id],
    queryFn: () => authFetch<SubcontractorDirectoryDetailDto>(`/subcontractors/${id}`),
  });

  if (isLoading) return <DetailSkeleton />;
  if (error) return <p className="text-red-400">{(error as Error).message}</p>;
  if (!subcontractor) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-silver-200">{subcontractor.companyName}</h1>
        <WhatsAppShareButton
          text={t("subcontractorDetail.shareText", { name: subcontractor.companyName, city: subcontractor.city })}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-green-500 hover:text-green-400"
        />
      </div>
      <p className="mt-1 text-silver-500">
        {subcontractor.city}
        {subcontractor.district ? ` / ${subcontractor.district}` : ""}
      </p>

      {subcontractor.phone && (
        <div className="mt-3 flex flex-wrap gap-2">
          <PhoneCallButton
            phone={subcontractor.phone}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 sm:flex-none"
          />
          <WhatsAppContactButton
            phone={subcontractor.phone}
            message={t("subcontractorDetail.contactMessage", { name: subcontractor.companyName })}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 sm:flex-none"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {subcontractor.tradeCategories.map((v) => (
          <span key={v} className="inline-block rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">
            {TRADE_CATEGORIES.find((t) => t.value === v)?.label ?? v}
          </span>
        ))}
      </div>

      {subcontractor.description && (
        <p className="mt-4 text-sm text-silver-400">{subcontractor.description}</p>
      )}
    </div>
  );
}