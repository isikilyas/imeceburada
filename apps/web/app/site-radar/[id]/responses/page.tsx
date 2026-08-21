"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteRequestResponseDto, SiteRequestResponseStatus } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";

const STATUS_LABELS: Record<SiteRequestResponseStatus, string> = {
  PENDING: "Beklemede",
  ACCEPTED: "Kabul Edildi",
  REJECTED: "Reddedildi",
};

export default function SiteRequestResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  const { data: responses, isLoading } = useQuery({
    queryKey: ["site-request-responses", id],
    queryFn: () => authFetch<SiteRequestResponseDto[]>(`/site-requests/${id}/responses`),
  });

  async function updateStatus(responseId: string, status: SiteRequestResponseStatus) {
    await authFetch(`/site-requests/responses/${responseId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries({ queryKey: ["site-request-responses", id] });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">Gelen Yanıtlar</h1>
      {isLoading && <p className="text-silver-500">Yükleniyor...</p>}
      {responses?.length === 0 && <p className="text-silver-500">Henüz yanıt yok.</p>}

      <div className="space-y-3">
        {responses?.map((r) => (
          <div key={r.id} className="rounded-lg border border-ink-800 bg-ink-900 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-silver-200">{r.responderName}</p>
                {r.message && <p className="mt-1 text-sm text-silver-400">{r.message}</p>}
                <p className="mt-1 text-xs text-silver-500">{STATUS_LABELS[r.status]}</p>
              </div>
              {r.status === "PENDING" && (
                <div className="flex shrink-0 gap-2 text-sm">
                  <button
                    onClick={() => updateStatus(r.id, "ACCEPTED")}
                    className="rounded-md bg-gold-500 px-3 py-1 text-ink-950 hover:bg-gold-400"
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "REJECTED")}
                    className="rounded-md border border-ink-700 px-3 py-1 text-silver-400 hover:border-red-400 hover:text-red-400"
                  >
                    Reddet
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
