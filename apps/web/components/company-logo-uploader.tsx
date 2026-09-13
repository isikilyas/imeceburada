"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Avatar } from "@/components/avatar";
import { useLocale } from "@/lib/i18n/locale-context";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_SIZE_MB = MAX_SIZE_BYTES / (1024 * 1024);

/** Firma/tedarikçi/taşeron panellerinde ortak logo yükleme bileşeni. */
export function CompanyLogoUploader({ logoUrl, queryKey }: { logoUrl?: string | null; queryKey: string }) {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(t("formComponents.photoUploader.invalidFileType"));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t("formComponents.photoUploader.fileTooLarge", { size: MAX_SIZE_MB }));
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      await authFetch("/users/me/company-logo", { method: "POST", body: formData });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("formComponents.photoUploader.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setIsUploading(true);
    try {
      await authFetch("/users/me/company-logo", { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("formComponents.photoUploader.removeFailed"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar photoUrl={logoUrl} size={80} />
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-gold-500 hover:text-gold-400 disabled:opacity-60"
          >
            {isUploading
              ? t("common.loading")
              : logoUrl
                ? t("formComponents.photoUploader.change")
                : t("formComponents.photoUploader.uploadLogo")}
          </button>
          {logoUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-500 transition hover:border-red-500 hover:text-red-400 disabled:opacity-60"
            >
              {t("formComponents.photoUploader.remove")}
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-silver-500">
          {t("formComponents.photoUploader.hint", { size: MAX_SIZE_MB })}
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
