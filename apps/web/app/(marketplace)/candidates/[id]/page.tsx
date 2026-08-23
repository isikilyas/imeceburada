"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CandidateDirectoryDetailDto, TRADE_CATEGORIES } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { maskPhone } from "@/lib/phone";
import { WhatsAppContactButton } from "@/components/whatsapp-contact-button";
import { Avatar } from "@/components/avatar";
import { DetailSkeleton } from "@/components/detail-skeleton";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const { t } = useLocale();

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => authFetch<CandidateDirectoryDetailDto>(`/candidates/${id}`),
  });

  if (isLoading) return <DetailSkeleton />;
  if (error) return <p className="text-red-400">{(error as Error).message}</p>;
  if (!candidate) return null;

  const tradeLabel =
    TRADE_CATEGORIES.find((t) => t.value === candidate.primaryTradeCategory)?.label ??
    candidate.primaryTradeCategory ??
    "";
  const isAvailable = candidate.availabilityStatus === "AVAILABLE";

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar photoUrl={candidate.photoUrl} size={56} />
          <h1 className="text-2xl font-semibold text-silver-200">{candidate.fullName}</h1>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isAvailable ? "bg-green-500/15 text-green-400" : "bg-ink-800 text-silver-500"
          }`}
        >
          {isAvailable ? "🟢 Müsait" : "🔴 Şu An Çalışıyor"}
        </span>
      </div>
      <p className="mt-1 text-silver-500">
        {candidate.city}
        {candidate.district ? ` / ${candidate.district}` : ""} · {candidate.experienceYears} yıl deneyim
      </p>
      <span className="mt-3 inline-block rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">{tradeLabel}</span>

      {candidate.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span key={skill} className="rounded-full border border-ink-700 px-3 py-1 text-xs text-silver-400">
              {skill}
            </span>
          ))}
        </div>
      )}

      {candidate.workPreferences.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-silver-500">Çalışma Şekli Tercihleri</p>
          <div className="flex flex-wrap gap-2">
            {candidate.workPreferences.map((v) => (
              <span key={v} className="rounded-full bg-ink-800 px-3 py-1 text-xs text-silver-400">
                {t(`enums.workPreference.${v}`)}
              </span>
            ))}
          </div>
        </div>
      )}

      {candidate.phone && (
        <div className="mt-8 rounded-lg border border-gold-500/40 bg-ink-900 p-4">
          <p className="text-sm text-silver-500">İletişim</p>
          <p className="mt-1 text-lg font-medium text-gold-400">{maskPhone(candidate.phone)}</p>
          <div className="mt-3">
            <WhatsAppContactButton
              phone={candidate.phone}
              message={`Merhaba, platformunuzdaki ${tradeLabel} profilinizi gördüm. Görüşmek isterseniz müsait misiniz?`}
              disabled={!isAvailable}
              disabledLabel="Şu an iş aramıyor"
            />
          </div>
        </div>
      )}
    </div>
  );
}