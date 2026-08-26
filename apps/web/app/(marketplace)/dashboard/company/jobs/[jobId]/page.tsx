"use client";

import { useParams } from "next/navigation";
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

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: () => authFetch<ApplicationDto[]>(`/applications/job/${jobId}`),
  });

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    await authFetch(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
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
          <div key={app.id} className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-900 p-4">
            <div>
              <p className="font-medium text-silver-200">{app.candidateName}</p>
              <p className="text-xs text-silver-500">{t(`dashboard.applicationStatus.${app.status}`)}</p>
            </div>
            <div className="flex gap-2 text-sm">
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
        ))}
      </div>
    </div>
  );
}
