"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { selectClass, inputClass } from "@/components/form";
import { FormSkeleton } from "@/components/form-skeleton";

interface AdminUserSummary {
  id: string;
  email: string;
  username: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  deactivatedAt: string | null;
  displayName: string | null;
  isPublic: boolean | null;
  photoUrl: string | null;
  membershipStatus: string | null;
  membershipExpiresAt: string | null;
  phoneVerified: boolean;
}

interface AdminUsersResponse {
  items: AdminUserSummary[];
  total: number;
  page: number;
  pageSize: number;
}

const ROLE_LABELS: Record<string, string> = {
  CANDIDATE: "Bireysel",
  COMPANY: "Firma",
  SUPPLIER: "Yapı Tedarik",
  SUBCONTRACTOR: "Taşeron",
  ADMIN: "Yönetici",
};

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", role, q, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (role) params.set("role", role);
      if (q) params.set("q", q);
      return authFetch<AdminUsersResponse>(`/admin/users?${params.toString()}`);
    },
    enabled: user?.role === "ADMIN",
  });

  if (authLoading) return <FormSkeleton rows={5} />;
  if (user?.role !== "ADMIN") return <p className="text-silver-500">Bu sayfayı görüntüleme yetkiniz yok.</p>;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-silver-300">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-silver-500">
          Hesap durumu, üyelik ve doğrulama bilgilerini görüntüle. Şifre gibi hassas bilgiler burada asla gösterilmez.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQ(searchInput.trim());
          setPage(1);
        }}
        className="flex flex-wrap gap-3"
      >
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className={`${selectClass} w-auto`}
        >
          <option value="">Tüm Roller</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          placeholder="E-posta ara..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={`${inputClass} w-64`}
        />
        <button
          type="submit"
          className="rounded-md border border-ink-700 px-3 py-2 text-sm text-silver-300 hover:border-gold-500 hover:text-gold-400"
        >
          Ara
        </button>
      </form>

      {isLoading ? (
        <FormSkeleton rows={5} />
      ) : (
        <>
          <div className="space-y-2">
            {data?.items.length === 0 && <p className="text-silver-500">Sonuç bulunamadı.</p>}
            {data?.items.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
              >
                <div>
                  <p className="font-medium text-silver-200">
                    {u.displayName ?? u.email}
                    {u.deactivatedAt && (
                      <span className="ml-2 rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-400">
                        Dondurulmuş
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-silver-500">
                    {u.email} · {ROLE_LABELS[u.role] ?? u.role}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-silver-500">
                  {u.membershipStatus && (
                    <span className={u.membershipStatus === "ACTIVE" ? "text-green-400" : "text-silver-500"}>
                      Üyelik: {u.membershipStatus}
                    </span>
                  )}
                  <span className={u.phoneVerified ? "text-green-400" : "text-silver-500"}>
                    Telefon: {u.phoneVerified ? "Doğrulandı" : "Doğrulanmadı"}
                  </span>
                  <span>Kayıt: {new Date(u.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-ink-700 px-3 py-1.5 text-silver-300 hover:border-gold-500 disabled:opacity-40"
              >
                Önceki
              </button>
              <span className="text-silver-500">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-ink-700 px-3 py-1.5 text-silver-300 hover:border-gold-500 disabled:opacity-40"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
