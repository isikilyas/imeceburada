"use client";

import Link from "next/link";
import { JobPostingDto, TRADE_CATEGORIES } from "@imeceburada/shared";
import { FavoriteButton } from "@/components/favorite-button";
import { VerifiedBadge } from "@/components/verified-badge";
import { useLocale } from "@/lib/i18n/locale-context";

function tradeLabel(value: string) {
  return TRADE_CATEGORIES.find((t) => t.value === value)?.label ?? value;
}

export function JobCard({ job }: { job: JobPostingDto }) {
  const { t } = useLocale();
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`block rounded-lg border bg-ink-900 p-4 transition hover:border-gold-500 ${
        job.isUrgent ? "border-red-500/40" : "border-ink-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {job.isUrgent && (
            <span className="mb-1 inline-block animate-pulse rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
              Acil
            </span>
          )}
          <h3 className="font-medium text-silver-200">{job.title}</h3>
          <p className="flex items-center gap-1 text-sm text-silver-500">
            {job.companyName}
            {job.companyVerified && <VerifiedBadge />}
          </p>
          <p className="mt-1 text-xs text-silver-400">{t(`enums.listingIntent.${job.listingType}`)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">
            {tradeLabel(job.tradeCategory)}
          </span>
          <FavoriteButton listingType="JOB" listingId={job.id} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-silver-500">
        <span>
          {job.city}
          {job.district ? ` / ${job.district}` : ""}
        </span>
        <span>·</span>
        <span>{t(`enums.employmentType.${job.employmentType}`)}</span>
        {(job.salaryMin || job.salaryMax) && (
          <>
            <span>·</span>
            <span>
              {job.salaryMin ?? "?"} - {job.salaryMax ?? "?"} ₺
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
