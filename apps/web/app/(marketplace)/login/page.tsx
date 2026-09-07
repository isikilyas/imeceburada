"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass, PasswordInput } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

const REMEMBERED_IDENTIFIER_KEY = "imeceburada.rememberedIdentifier";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_IDENTIFIER_KEY);
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (rememberMe) window.localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier);
      else window.localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
      await login({ identifier, password }, keepSignedIn);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş yapılamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.loginHeading")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-posta veya Telefon Numarası">
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Şifre">
          <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Beni Hatırla
          </label>
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />
            Oturumumu Açık Tut
          </label>
        </div>
        <p className="text-xs text-silver-500">
          Oturumumu Açık Tut kapalıysa, tarayıcıyı kapattığında oturumun otomatik olarak sona erer.
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm text-silver-500">
        <Link href="/forgot-password" className="text-gold-400 hover:underline">
          Şifremi Unuttum
        </Link>
        <span>
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-gold-400 hover:underline">
            Kayıt ol
          </Link>
        </span>
      </div>
    </div>
  );
}
