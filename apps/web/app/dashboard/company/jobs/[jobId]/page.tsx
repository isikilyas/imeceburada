"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationDto, ApplicationStatus } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Beklemede",
  REVIEWED: "İncelendi",
  ACCEPTED: "Kabul Edildi",
  REJECTED: "Reddedildi",
};

export default function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { authFetch } = useAuth();
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
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">Başvurular</h1>
      {isLoading && <p className="text-silver-500">Yükleniyor...</p>}
      {applications?.length === 0 && <p className="text-silver-500">Bu ilana henüz başvuru yok.</p>}

      <div className="space-y-3">
        {applications?.map((app) => (
          <div key={app.id} className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-900 p-4">
            <div>
              <p className="font-medium text-silver-200">{app.candidateName}</p>
              <p className="text-xs text-silver-500">{STATUS_LABELS[app.status]}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => updateStatus(app.id, "REVIEWED")}
                className="rounded-md border border-ink-700 px-3 py-1 text-silver-300 hover:border-gold-500"
              >
                İncelendi
              </button>
              <button
                onClick={() => updateStatus(app.id, "ACCEPTED")}
                className="rounded-md bg-gold-500 px-3 py-1 text-ink-950 hover:bg-gold-400"
              >
                Kabul Et
              </button>
              <button
                onClick={() => updateStatus(app.id, "REJECTED")}
                className="rounded-md border border-ink-700 px-3 py-1 text-silver-400 hover:border-red-400 hover:text-red-400"
              >
                Reddet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
