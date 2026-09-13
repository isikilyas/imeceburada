"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinde, mevcut oturum dahil tüm cihazlardan çıkış yapma işlemi. */
export function LogoutAllDevicesButton() {
  const { authFetch, logout } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/users/me/logout-all", { method: "POST" });
      logout();
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.logoutAll.failed"));
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="text-sm font-semibold text-silver-300">{t("accountPanel.logoutAll.heading")}</h2>
      <p className="mt-1 text-xs text-silver-500">{t("accountPanel.logoutAll.hint")}</p>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="mt-3 rounded-md border border-ink-700 px-3 py-1.5 text-xs font-medium text-silver-300 hover:bg-ink-800 disabled:opacity-60"
      >
        {isSubmitting ? t("accountPanel.logoutAll.loggingOut") : t("accountPanel.logoutAll.button")}
      </button>
    </section>
  );
}
