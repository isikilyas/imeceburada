"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SubcontractorDirectoryDetailDto, TRADE_CATEGORIES } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { WhatsAppContactButton } from "@/components/whatsapp-contact-button";
import { DetailSkeleton } from "@/components/detail-skeleton";
import { maskPhone } from "@/lib/phone";

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

      {subcontractor.phone && (
        <div className="mt-8 rounded-lg border border-gold-500/40 bg-ink-900 p-4">
          <p className="text-sm text-silver-500">{t("subcontractorDetail.contactLabel")}</p>
          <p className="mt-1 text-lg font-medium text-gold-400">{maskPhone(subcontractor.phone)}</p>
          <div className="mt-3">
            <WhatsAppContactButton
              phone={subcontractor.phone}
              message={t("subcontractorDetail.contactMessage", { name: subcontractor.companyName })}
            />
          </div>
        </div>
      )}
    </div>
  );
}