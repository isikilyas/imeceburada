"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass, PasswordInput } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Giriş başarılı olduğunda çağrılır — genelde kullanıcının erişmek istediği sayfaya yönlendirmek için. */
  onSuccess?: () => void;
}

/**
 * Misafir bir ziyaretçi giriş gerektiren bir aksiyona (ör. dizinde bir detay
 * sayfasını açmaya) kalkıştığında, sayfadan koparmadan giriş yapabilmesi için —
 * /login sayfasının basitleştirilmiş bir hâli.
 */
export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const { t } = useLocale();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIdentifier("");
    setPassword("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ identifier, password }, true);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loginModal.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-950 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-silver-200">{t("loginModal.heading")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("loginModal.close")}
            className="text-silver-500 hover:text-silver-300"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-silver-500">{t("loginModal.hint")}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label={t("loginModal.identifierLabel")}>
            <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={inputClass} />
          </Field>
          <Field label={t("loginModal.passwordLabel")}>
            <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? t("loginModal.submitting") : t("loginModal.submit")}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-silver-500">
          <Link href="/forgot-password" className="text-gold-400 hover:underline" onClick={onClose}>
            {t("loginModal.forgotPassword")}
          </Link>
          <span>
            {t("loginModal.noAccount")}{" "}
            <Link href="/register" className="text-gold-400 hover:underline" onClick={onClose}>
              {t("loginModal.registerLink")}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
