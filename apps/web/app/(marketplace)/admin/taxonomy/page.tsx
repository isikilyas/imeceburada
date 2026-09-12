"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminTaxonomyTerm, TAXONOMY_TERM_TYPES, TaxonomyTermType } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { FormSkeleton } from "@/components/form-skeleton";

const TYPE_LABELS: Record<TaxonomyTermType, string> = {
  TRADE_PROFESSION: "Meslek",
  MATERIAL_TYPE: "Malzeme Türü",
  MATERIAL_CATEGORY_ITEM: "Tedarik Kategorisi",
  EQUIPMENT_TYPE: "Ekipman Türü",
};

export default function AdminTaxonomyPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: terms, isLoading } = useQuery({
    queryKey: ["admin-taxonomy-terms-pending"],
    queryFn: () => authFetch<AdminTaxonomyTerm[]>("/admin/taxonomy-terms?status=PENDING"),
    enabled: user?.role === "ADMIN",
  });

  async function handleApprove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await authFetch(`/admin/taxonomy-terms/${id}/approve`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["admin-taxonomy-terms-pending"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "İşlem başarısız oldu");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await authFetch(`/admin/taxonomy-terms/${id}/reject`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["admin-taxonomy-terms-pending"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "İşlem başarısız oldu");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) return <FormSkeleton rows={5} />;
  if (user?.role !== "ADMIN") return <p className="text-silver-500">Bu sayfayı görüntüleme yetkiniz yok.</p>;

  const grouped = TAXONOMY_TERM_TYPES.map((type) => ({
    type,
    items: (terms ?? []).filter((t) => t.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-silver-300">Akıllı Doğrulama — Onay Bekleyen Terimler</h1>
        <p className="mt-1 text-sm text-silver-500">
          Kullanıcıların kapalı listede bulamayıp kendi yazdığı meslek/malzeme/ekipman terimleri — onaylanan bir
          terim, sonraki kullanıcılara &ldquo;bunu mu demek istediniz?&rdquo; önerisinde de gösterilir.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {isLoading ? (
        <FormSkeleton rows={5} />
      ) : grouped.length === 0 ? (
        <p className="text-silver-500">Onay bekleyen terim yok.</p>
      ) : (
        grouped.map((group) => (
          <section key={group.type} className="space-y-3">
            <h2 className="text-lg font-medium text-silver-300">{TYPE_LABELS[group.type]}</h2>
            <div className="space-y-3">
              {group.items.map((term) => (
                <div
                  key={term.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-ink-800 bg-ink-900 p-4"
                >
                  <div>
                    <p className="font-medium text-silver-200">{term.label}</p>
                    <p className="text-xs text-silver-500">{new Date(term.createdAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleApprove(term.id)}
                      disabled={busyId === term.id}
                      className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => handleReject(term.id)}
                      disabled={busyId === term.id}
                      className="rounded-md border border-ink-700 px-3 py-1.5 text-xs font-medium text-silver-300 hover:border-red-400 hover:text-red-400 disabled:opacity-60"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
