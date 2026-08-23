"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Avatar } from "@/components/avatar";
import { useLocale } from "@/lib/i18n/locale-context";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_SIZE_MB = MAX_SIZE_BYTES / (1024 * 1024);

/** Ekipman/malzeme ilanları için tekil fotoğraf yükleyici — CandidatePhotoUploader ile aynı mantık, uç noktası ilana göre parametrik. */
export function ListingPhotoUploader({
  endpoint,
  photoUrl,
  invalidateKey,
}: {
  endpoint: string;
  photoUrl?: string | null;
  invalidateKey: unknown[];
}) {
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
      formData.append("photo", file);
      await authFetch(endpoint, { method: "POST", body: formData });
      queryClient.invalidateQueries({ queryKey: invalidateKey });
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
      await authFetch(endpoint, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("formComponents.photoUploader.removeFailed"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar photoUrl={photoUrl} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-md border border-ink-700 px-2.5 py-1 text-xs text-silver-300 transition hover:border-gold-500 hover:text-gold-400 disabled:opacity-60"
          >
            {isUploading
              ? t("common.loading")
              : photoUrl
                ? t("formComponents.photoUploader.change")
                : t("formComponents.photoUploader.uploadListing")}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-md border border-ink-700 px-2.5 py-1 text-xs text-silver-500 transition hover:border-red-500 hover:text-red-400 disabled:opacity-60"
            >
              {t("formComponents.photoUploader.remove")}
            </button>
          )}
        </div>
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
