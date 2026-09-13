"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinde, girişte kullanılmayan, isteğe bağlı görünen kullanıcı adı alanı — kendi kaydetme akışına sahip. */
export function UsernameField({ value, queryKey }: { value?: string | null; queryKey: string }) {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUsername(value ?? "");
  }, [value]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      await authFetch("/users/me/username", {
        method: "PATCH",
        body: JSON.stringify({ username: username.trim() || null }),
      });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.username.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <Field label={t("accountPanel.username.label")}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t("accountPanel.username.placeholder")}
          className={inputClass}
        />
      </Field>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md border border-ink-700 px-3 py-2 text-sm text-silver-300 hover:border-gold-500 hover:text-gold-400 disabled:opacity-60"
      >
        {isSaving ? t("dashboard.form.saving") : t("dashboard.form.save")}
      </button>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
      {success && <p className="w-full text-xs text-green-400">{t("dashboard.form.saved")}</p>}
    </form>
  );
}
