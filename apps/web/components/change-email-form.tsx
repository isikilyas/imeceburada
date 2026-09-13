"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, PasswordInput, inputClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinde, oturum açıkken e-posta değiştirme — yeni adrese kod gönderilir, kod onaylanınca e-posta değişir. */
export function ChangeEmailForm() {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/users/me/email/request-change", {
        method: "POST",
        body: JSON.stringify({ newEmail, password }),
      });
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.changeEmail.requestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/users/me/email/confirm-change", { method: "POST", body: JSON.stringify({ code }) });
      queryClient.invalidateQueries({ queryKey: ["my-candidate-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-company-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-supplier-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-subcontractor-profile"] });
      setSuccess(true);
      setStep("request");
      setNewEmail("");
      setPassword("");
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.changeEmail.confirmFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="mb-3 text-sm font-semibold text-silver-300">{t("accountPanel.changeEmail.heading")}</h2>
      {step === "request" ? (
        <form onSubmit={handleRequest} className="max-w-xs space-y-3">
          <Field label={t("accountPanel.changeEmail.newEmailLabel")}>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label={t("accountPanel.changeEmail.passwordLabel")}>
            <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-green-400">{t("accountPanel.changeEmail.changed")}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? t("accountPanel.changeEmail.sendingCode") : t("accountPanel.changeEmail.sendCodeButton")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="max-w-xs space-y-3">
          <p className="text-xs text-silver-500">{t("accountPanel.changeEmail.confirmHint")}</p>
          <Field label={t("accountPanel.changeEmail.codeLabel")}>
            <input required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
          </Field>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
            >
              {isSubmitting ? t("accountPanel.changeEmail.verifying") : t("accountPanel.changeEmail.verifyButton")}
            </button>
            <button
              type="button"
              onClick={() => setStep("request")}
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
