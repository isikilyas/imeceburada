"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });
      setStatus("done");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Şifre sıfırlanamadı");
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-red-400">
        Geçersiz sıfırlama linki.{" "}
        <Link href="/forgot-password" className="text-gold-400 hover:underline">
          Yeni link iste
        </Link>
      </p>
    );
  }

  if (status === "done") {
    return <p className="text-sm text-green-400">Şifren güncellendi. Girişe yönlendiriliyorsun...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Yeni Şifre (en az 8 karakter)">
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "submitting" ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">Şifre Sıfırla</h1>
      <Suspense fallback={<p className="text-silver-500">Yükleniyor...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}