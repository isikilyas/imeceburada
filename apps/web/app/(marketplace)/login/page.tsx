"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

const REMEMBERED_EMAIL_KEY = "imeceburada.rememberedEmail";

type LoginMethod = "email" | "phone";

export default function LoginPage() {
  const { login, requestPhoneLogin, verifyPhoneLogin } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberEmail(true);
    }
  }, []);

  async function handleEmailSubmit(e: FormEvent) {
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

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestPhoneLogin(phone);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kod gönderilemedi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyPhoneLogin(phone, code, keepSignedIn);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş yapılamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMethod(next: LoginMethod) {
    setMethod(next);
    setError(null);
    setCodeSent(false);
    setCode("");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.loginHeading")}</h1>

      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => switchMethod("email")}
          className={`rounded-md px-2 py-2 text-sm font-medium ${
            method === "email" ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-400"
          }`}
        >
          E-posta ile
        </button>
        <button
          type="button"
          onClick={() => switchMethod("phone")}
          className={`rounded-md px-2 py-2 text-sm font-medium ${
            method === "phone" ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-400"
          }`}
        >
          Telefon ile
        </button>
      </div>

      {method === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
      ) : !codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <p className="text-xs text-silver-500">
            Telefonla giriş, sadece telefon numarasını daha önce panelinden doğrulamış Firma, Yapı Tedarik ve Taşeron
            Firma hesapları içindir.
          </p>
          <Field label="Telefon Numarası">
            <input
              type="tel"
              required
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? "Gönderiliyor..." : "Kod Gönder"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <p className="text-sm text-silver-300">
            <strong>{phone}</strong> numarasına gönderdiğimiz 6 haneli kodu gir.
          </p>
          <Field label="Doğrulama Kodu">
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />
            Oturumumu Açık Tut
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
          <button
            type="button"
            onClick={() => setCodeSent(false)}
            className="w-full text-center text-xs text-silver-500 hover:underline"
          >
            Numarayı değiştir / kodu tekrar gönder
          </button>
        </form>
      )}

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
