"use client";

import { MouseEvent, useState } from "react";
import { FavoriteListingType } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { useLocale } from "@/lib/i18n/locale-context";

export function FavoriteButton({
  listingType,
  listingId,
  className = "",
}: {
  listingType: FavoriteListingType;
  listingId: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { t } = useLocale();
  const [isPending, setIsPending] = useState(false);

  if (!user) return null;

  const active = isFavorited(listingType, listingId);

  async function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    setIsPending(true);
    try {
      await toggleFavorite(listingType, listingId);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={active}
      aria-label={active ? t("components.favoriteButton.remove") : t("components.favoriteButton.add")}
      title={active ? t("components.favoriteButton.remove") : t("components.favoriteButton.add")}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-ink-800 disabled:opacity-60 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition ${active ? "fill-gold-400 stroke-gold-400" : "fill-none stroke-silver-400"}`}
        strokeWidth={1.8}
      >
        <path
          d="M12 20.5s-7.5-4.6-10-9.1C0.3 8 1.7 4.5 5 3.5c2.2-0.7 4.4 0.2 5.7 2C11 6 12 6 12 6s1-0 1.3-0.5c1.3-1.8 3.5-2.7 5.7-2 3.3 1 4.7 4.5 3 7.9-2.5 4.5-10 9.1-10 9.1Z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
