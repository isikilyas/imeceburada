"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, PasswordInput } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

/** Tüm rol panellerinde (Aday/Firma/Tedarikçi/Taşeron) ortak kullanılan hesap silme bölümü. */
export function DeleteAccountSection() {
  const { authFetch, logout } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/users/me", { method: "DELETE", body: JSON.stringify({ password }) });
      logout();
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("account.deleteFailed"));
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-red-900/50 bg-red-950/10 p-4">
      <h2 className="text-sm font-semibold text-red-400">{t("account.deleteHeading")}</h2>
      <p className="mt-1 text-xs text-silver-500">{t("account.deleteWarning")}</p>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 rounded-md border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/30"
        >
          {t("account.deleteButton")}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 max-w-xs space-y-3">
          <Field label={t("account.deleteConfirmPasswordLabel")}>
            <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
            >
              {isSubmitting ? t("account.deleting") : t("account.deleteConfirmButton")}
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setPassword("");
                setError(null);
              }}
              className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-silver-400 hover:bg-ink-900"
            >
              {t("account.deleteCancelButton")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
