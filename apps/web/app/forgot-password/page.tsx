"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "İstek gönderilemedi");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.forgotPasswordHeading")}</h1>

      {status === "done" ? (
        <p className="text-sm text-silver-300">
          Girdiğin e-posta adresi sistemde kayıtlıysa, şifre sıfırlama linkini içeren bir e-posta gönderildi.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="E-posta">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {status === "submitting" ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-silver-500">
        <Link href="/login" className="text-gold-400 hover:underline">
          Girişe dön
        </Link>
      </p>
    </div>
  );
}