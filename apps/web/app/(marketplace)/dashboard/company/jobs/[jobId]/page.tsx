"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationDto, ApplicationStatus, JobMatchDto } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ListSkeleton } from "@/components/list-skeleton";

export default function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [offerDrafts, setOfferDrafts] = useState<Record<string, string>>({});

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: () => authFetch<ApplicationDto[]>(`/applications/job/${jobId}`),
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["job-matches", jobId],
    queryFn: () => authFetch<JobMatchDto[]>(`/jobs/${jobId}/matches`),
  });

  async function updateStatus(applicationId: string, status: ApplicationStatus, offeredWage?: number) {
    await authFetch(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, ...(offeredWage !== undefined ? { offeredWage } : {}) }),
    });
    queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
  }

  async function sendOffer(app: ApplicationDto) {
    const draft = offerDrafts[app.id];
    if (!draft) return;
    await updateStatus(app.id, app.status, Number(draft));
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("dashboard.companyJobDetail.heading")}</h1>
      {isLoading && <ListSkeleton count={3} />}
      {applications?.length === 0 && (
        <p className="text-silver-500">{t("dashboard.companyJobDetail.noApplications")}</p>
      )}

      <div className="space-y-3">
        {applications?.map((app) => (
          <div key={app.id} className="rounded-lg border border-ink-800 bg-ink-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-silver-200">{app.applicantName}</p>
                <p className="text-xs text-silver-500">{t(`dashboard.applicationStatus.${app.status}`)}</p>
                {app.expectedWage != null && (
                  <p className="mt-1 text-xs text-gold-400">Beklediği ücret: {app.expectedWage.toLocaleString("tr-TR")} ₺/ay</p>
                )}
                {app.offeredWage != null && (
                  <p className="text-xs text-silver-400">Teklif ettiğiniz: {app.offeredWage.toLocaleString("tr-TR")} ₺/ay</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/messages/${app.id}`}
                  className="rounded-md border border-ink-700 px-3 py-1 text-gold-400 hover:border-gold-500"
                >
                  {t("nav.messages")}
                </Link>
                <button
                  onClick={() => updateStatus(app.id, "REVIEWED")}
                  className="rounded-md border border-ink-700 px-3 py-1 text-silver-300 hover:border-gold-500"
                >
                  {t("dashboard.companyJobDetail.markReviewedButton")}
                </button>
                <button
                  onClick={() => updateStatus(app.id, "ACCEPTED")}
                  className="rounded-md bg-gold-500 px-3 py-1 text-ink-950 hover:bg-gold-400"
                >
                  {t("dashboard.companyJobDetail.acceptButton")}
                </button>
                <button
                  onClick={() => updateStatus(app.id, "REJECTED")}
                  className="rounded-md border border-ink-700 px-3 py-1 text-silver-400 hover:border-red-400 hover:text-red-400"
                >
                  {t("dashboard.companyJobDetail.rejectButton")}
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-ink-800 pt-3">
              <input
                type="number"
                min={0}
                placeholder="Teklif ettiğiniz ücret (₺/ay)"
                value={offerDrafts[app.id] ?? ""}
                onChange={(e) => setOfferDrafts((d) => ({ ...d, [app.id]: e.target.value }))}
                className="w-56 rounded-md border border-ink-700 bg-ink-950 px-3 py-1.5 text-sm text-silver-200 focus:border-gold-500 focus:outline-none"
              />
              <button
                onClick={() => sendOffer(app)}
                disabled={!offerDrafts[app.id]}
                className="rounded-md border border-gold-500/40 px-3 py-1.5 text-sm text-gold-400 hover:bg-gold-500/10 disabled:opacity-50"
              >
                Teklif Gönder
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-ink-800 pt-8">
        <h2 className="mb-1 text-xl font-semibold text-silver-300">{t("dashboard.companyJobDetail.matchesHeading")}</h2>
        <p className="mb-6 text-sm text-silver-500">{t("dashboard.companyJobDetail.matchesHint")}</p>
        {matchesLoading && <ListSkeleton count={3} />}
        {matches?.length === 0 && (
          <p className="text-silver-500">{t("dashboard.companyJobDetail.matchesEmpty")}</p>
        )}
        <div className="space-y-3">
          {matches?.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-800 bg-ink-900 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-silver-200">{m.name}</p>
                  <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-xs font-semibold text-gold-400">
                    {t("dashboard.companyJobDetail.matchScoreLabel", { score: m.score })}
                  </span>
                  {m.alreadyApplied && (
                    <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-silver-400">
                      {t("dashboard.companyJobDetail.alreadyAppliedBadge")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-silver-500">
                  {m.city}
                  {m.district ? ` / ${m.district}` : ""}
                </p>
                {m.reasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.reasons.map((reason) => (
                      <span key={reason} className="rounded bg-ink-800 px-1.5 py-0.5 text-[11px] text-silver-400">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={m.applicantType === "CANDIDATE" ? `/candidates/${m.id}` : `/subcontractors/${m.id}`}
                className="shrink-0 rounded-md border border-ink-700 px-3 py-1 text-sm text-gold-400 hover:border-gold-500"
              >
                {t("dashboard.companyJobDetail.viewProfileLink")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
