"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { EQUIPMENT_TYPES, SiteRequestDto, TRADE_CATEGORIES } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";

export default function MySiteRequestsPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["my-site-requests"],
    queryFn: () => authFetch<SiteRequestDto[]>("/site-requests/mine"),
    enabled: !!user,
  });

  async function handleClose(id: string) {
    await authFetch(`/site-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status: "CLOSED" }) });
    queryClient.invalidateQueries({ queryKey: ["my-site-requests"] });
  }

  if (authLoading) return <p className="text-silver-500">Yükleniyor...</p>;
  if (!user) return <p className="text-silver-500">Bu sayfayı görmek için giriş yapmalısın.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">Çağrılarım</h1>
      {isLoading && <p className="text-silver-500">Yükleniyor...</p>}
      {requests?.length === 0 && <p className="text-silver-500">Henüz çağrı açmadın.</p>}

      <div className="space-y-3">
        {requests?.map((r) => {
          const kindLabel =
            r.requestType === "WORKER"
              ? TRADE_CATEGORIES.find((t) => t.value === r.tradeCategory)?.label
              : EQUIPMENT_TYPES.find((e) => e.value === r.equipmentType)?.label;
          return (
            <div key={r.id} className="rounded-lg border border-ink-800 bg-ink-900 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-silver-200">{r.title}</p>
                  <p className="text-xs text-silver-500">
                    {kindLabel} · {r.city} · {r.status === "OPEN" ? "Açık" : "Kapalı"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-sm">
                  <Link href={`/site-radar/${r.id}/responses`} className="text-gold-400 hover:underline">
                    Yanıtlar ({r.responseCount})
                  </Link>
                  {r.status === "OPEN" && (
                    <button onClick={() => handleClose(r.id)} className="text-silver-500 hover:text-red-400">
                      Kapat
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
