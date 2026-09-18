"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationDto, ApplicationStatus } from "@imeceburada/shared";
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
                <p className="font-medium text-silver-200">{app.candidateName}</p>
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
    </div>
  );
}
