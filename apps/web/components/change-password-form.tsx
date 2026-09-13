"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, PasswordInput } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinde, oturum açıkken şifre değiştirme formu. */
export function ChangePasswordForm() {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await authFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.security.changePasswordFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="mb-3 text-sm font-semibold text-silver-300">
        {t("accountPanel.security.changePasswordHeading")}
      </h2>
      <form onSubmit={handleSubmit} className="max-w-xs space-y-3">
        <Field label={t("accountPanel.security.currentPasswordLabel")}>
          <PasswordInput
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field label={t("accountPanel.security.newPasswordLabel")}>
          <PasswordInput required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </Field>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-green-400">{t("accountPanel.security.passwordChanged")}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? t("accountPanel.security.changingPassword") : t("accountPanel.security.changePasswordButton")}
        </button>
      </form>
    </section>
  );
}
