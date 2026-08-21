"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Avatar } from "@/components/avatar";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function CandidatePhotoUploader({ photoUrl }: { photoUrl?: string | null }) {
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
      setError("Sadece JPEG, PNG veya WEBP dosyaları yüklenebilir");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Dosya boyutu en fazla 5 MB olabilir");
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await authFetch("/users/me/candidate-photo", { method: "POST", body: formData });
      queryClient.invalidateQueries({ queryKey: ["my-candidate-profile"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yükleme başarısız oldu");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setIsUploading(true);
    try {
      await authFetch("/users/me/candidate-photo", { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["my-candidate-profile"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kaldırılamadı");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar photoUrl={photoUrl} size={80} />
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-gold-500 hover:text-gold-400 disabled:opacity-60"
          >
            {isUploading ? "Yükleniyor..." : photoUrl ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-500 transition hover:border-red-500 hover:text-red-400 disabled:opacity-60"
            >
              Kaldır
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-silver-500">JPEG, PNG veya WEBP · en fazla 5 MB</p>
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
