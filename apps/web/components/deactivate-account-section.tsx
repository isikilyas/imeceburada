"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, PasswordInput } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinde, kalıcı silmeden farklı olarak geri alınabilir hesap dondurma bölümü. */
export function DeactivateAccountSection() {
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
      await authFetch("/users/me/deactivate", { method: "POST", body: JSON.stringify({ password }) });
      logout();
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.deactivate.failed"));
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="text-sm font-semibold text-silver-300">{t("accountPanel.deactivate.heading")}</h2>
      <p className="mt-1 text-xs text-silver-500">{t("accountPanel.deactivate.warning")}</p>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 rounded-md border border-ink-700 px-3 py-1.5 text-xs font-medium text-silver-300 hover:bg-ink-800"
        >
          {t("accountPanel.deactivate.button")}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 max-w-xs space-y-3">
          <Field label={t("accountPanel.deactivate.confirmPasswordLabel")}>
            <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-ink-700 px-3 py-1.5 text-xs font-medium text-silver-200 hover:bg-ink-600 disabled:opacity-60"
            >
              {isSubmitting ? t("accountPanel.deactivate.deactivating") : t("accountPanel.deactivate.confirmButton")}
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
              {t("accountPanel.deactivate.cancelButton")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
