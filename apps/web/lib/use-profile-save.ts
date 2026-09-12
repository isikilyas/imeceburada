import { useState } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

export type ProfileSaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Shared idle/saving/saved/error state machine for the 4 role dashboards'
 * profile editors — each has its own field state and form, but they all
 * PATCH an endpoint and handle the result identically.
 */
export function useProfileSave(endpoint: string, queryKey: QueryKey) {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProfileSaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function save(body: unknown) {
    setStatus("saving");
    setError(null);
    try {
      await authFetch(endpoint, { method: "PATCH", body: JSON.stringify(body) });
      queryClient.invalidateQueries({ queryKey });
      setStatus("saved");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.form.saveFailed"));
      setStatus("error");
    }
  }

  return { status, error, save, setError };
}
