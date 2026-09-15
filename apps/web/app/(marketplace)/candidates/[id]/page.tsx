"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CandidateDirectoryDetailDto, TRADE_CATEGORIES } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { WhatsAppContactButton } from "@/components/whatsapp-contact-button";
import { PhoneCallButton } from "@/components/phone-call-button";
import { Avatar } from "@/components/avatar";
import { StarRating } from "@/components/star-rating";
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
      {!isAvailable && candidate.availableFrom && (
        <p className="mt-1 text-sm text-silver-500">
          {new Date(candidate.availableFrom).toLocaleDateString("tr-TR")} tarihinden itibaren müsait olacak
        </p>
      )}

      {candidate.phone && (
        <div className="mt-3 flex flex-wrap gap-2">
          <PhoneCallButton
            phone={candidate.phone}
            disabled={!isAvailable}
            disabledLabel="Şu an iş aramıyor"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 sm:flex-none"
          />
          <WhatsAppContactButton
            phone={candidate.phone}
            message={`Merhaba, platformunuzdaki ${tradeLabel} profilinizi gördüm. Görüşmek isterseniz müsait misiniz?`}
            disabled={!isAvailable}
            disabledLabel="Şu an iş aramıyor"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 sm:flex-none"
          />
        </div>
      )}

      <p className="mt-3 text-silver-500">
        {candidate.city}
        {candidate.district ? ` / ${candidate.district}` : ""} · {candidate.experienceYears} yıl deneyim
      </p>
      <div className="mt-2">
        <StarRating averageRating={candidate.averageRating} reviewCount={candidate.reviewCount} size="md" />
      </div>
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
    </div>
  );
}