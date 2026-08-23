"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

const REMEMBERED_EMAIL_KEY = "bau360.rememberedEmail";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberEmail(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (rememberEmail) window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      else window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      await login({ email, password }, keepSignedIn);
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
        <Field label="E-posta">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Şifre">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" checked={rememberEmail} onChange={(e) => setRememberEmail(e.target.checked)} />
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