"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { JobPostingDto, TRADE_CATEGORIES } from "@bau360/shared";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { VerifiedBadge } from "@/components/verified-badge";
import { DetailSkeleton } from "@/components/detail-skeleton";

export function JobDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const [applyState, setApplyState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [applyError, setApplyError] = useState<string | null>(null);

  const {
    data: job,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => apiFetch<JobPostingDto>(`/jobs/${id}`),
  });

  async function handleApply() {
    setApplyState("submitting");
    setApplyError(null);
    try {
      await authFetch(`/applications`, { method: "POST", body: JSON.stringify({ jobId: id }) });
      setApplyState("done");
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.message : "Başvuru gönderilemedi");
      setApplyState("error");
    }
  }

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
  if (!job) return <p className="text-silver-500">İlan bulunamadı.</p>;

  const tradeLabel = TRADE_CATEGORIES.find((tc) => tc.value === job.tradeCategory)?.label ?? job.tradeCategory;
  const employmentLabel = t(`enums.employmentType.${job.employmentType}`);
  const listingTypeLabel = t(`enums.listingIntent.${job.listingType}`);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 text-xs text-silver-500">{listingTypeLabel}</p>
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">{tradeLabel}</span>
        {job.isUrgent && (
          <span className="inline-block animate-pulse rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
            Acil
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-silver-200">{job.title}</h1>
        <WhatsAppShareButton
          text={`🏗️ ${job.title} — ${job.companyName} (${job.city})\nİmece Burada'da incele:`}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-green-500 hover:text-green-400"
        />
      </div>
      <p className="mt-1 flex items-center gap-1 text-silver-500">
        {job.companyName}
        {job.companyVerified && <VerifiedBadge />}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-silver-500">
        <span>
          {job.city}
          {job.district ? ` / ${job.district}` : ""}
        </span>
        <span>·</span>
        <span>{employmentLabel}</span>
        {(job.salaryMin || job.salaryMax) && (
          <>
            <span>·</span>
            <span>
              {job.salaryMin ?? "?"} - {job.salaryMax ?? "?"} ₺
            </span>
          </>
        )}
      </div>

      <p className="mt-6 whitespace-pre-wrap text-silver-300">{job.description}</p>

      <div className="mt-8">
        {!authLoading && !user && <p className="text-sm text-silver-500">Başvurmak için giriş yapmalısın.</p>}
        {user?.role === "CANDIDATE" && applyState !== "done" && (
          <button
            onClick={handleApply}
            disabled={applyState === "submitting"}
            className="rounded-md bg-gold-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {applyState === "submitting" ? "Gönderiliyor..." : "Başvur"}
          </button>
        )}
        {applyState === "done" && <p className="text-sm text-green-400">Başvurun alındı!</p>}
        {applyError && (
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-red-400">{applyError}</p>
            <button onClick={handleApply} className="text-sm text-gold-400 hover:underline">
              Tekrar dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
