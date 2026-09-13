"use client";

import { useQuery } from "@tanstack/react-query";
import { MembershipHistoryEntry } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ListSkeleton } from "@/components/list-skeleton";

const STATUS_LABELS: Record<string, string> = {
  NONE: "Yok",
  PENDING: "Beklemede",
  ACTIVE: "Aktif",
  EXPIRED: "Süresi Doldu",
  CANCELED: "İptal Edildi",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-400",
  PENDING: "text-amber-400",
  EXPIRED: "text-silver-500",
  CANCELED: "text-red-400",
};

/** Hesabım panelinin Üyelik sekmesinde geçmiş üyelik/fatura kayıtlarını listeler. */
export function MembershipHistoryList() {
  const { authFetch } = useAuth();
  const { data: history, isLoading } = useQuery({
    queryKey: ["my-membership-history"],
    queryFn: () => authFetch<MembershipHistoryEntry[]>("/membership/history"),
  });

  if (isLoading) return <ListSkeleton count={2} />;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-silver-300">Faturalarım / Ödeme Geçmişim</h2>
      {history?.length === 0 && <p className="text-sm text-silver-500">Henüz bir üyelik kaydın yok.</p>}
      {history?.map((entry) => (
        <div key={entry.id} className="rounded-lg border border-ink-800 bg-ink-900 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-silver-200">
              {entry.planLabel ?? entry.plan}
              {entry.planPriceLabel && <span className="ml-2 text-silver-500">· {entry.planPriceLabel}</span>}
            </p>
            <span className={STATUS_COLORS[entry.status] ?? "text-silver-400"}>
              {STATUS_LABELS[entry.status] ?? entry.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-silver-500">
            Oluşturulma: {new Date(entry.createdAt).toLocaleDateString("tr-TR")}
            {entry.startedAt && ` · Başlangıç: ${new Date(entry.startedAt).toLocaleDateString("tr-TR")}`}
            {entry.currentPeriodEnd && ` · Bitiş: ${new Date(entry.currentPeriodEnd).toLocaleDateString("tr-TR")}`}
          </p>
          {entry.billingContactName && (
            <p className="mt-1 text-xs text-silver-500">
              Fatura: {entry.billingContactName}
              {entry.billingCity && `, ${entry.billingCity}`}
              {entry.billingAddress && ` — ${entry.billingAddress}`}
              {entry.billingZipCode && ` (${entry.billingZipCode})`}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
