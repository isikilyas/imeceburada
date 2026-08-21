"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { FavoriteDto, FavoriteListingType } from "@bau360/shared";
import { useAuth } from "./auth-context";
import { ApiError } from "./api-client";

interface FavoritesContextValue {
  favorites: FavoriteDto[];
  isFavorited: (listingType: FavoriteListingType, listingId: string) => boolean;
  toggleFavorite: (listingType: FavoriteListingType, listingId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, authFetch } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const data = await authFetch<FavoriteDto[]>("/favorites");
      setFavorites(data);
    } catch {
      setFavorites([]);
    }
  }, [user, authFetch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorited = useCallback(
    (listingType: FavoriteListingType, listingId: string) =>
      favorites.some((f) => f.listingType === listingType && f.listingId === listingId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (listingType: FavoriteListingType, listingId: string) => {
      if (!user) throw new ApiError(401, "Favorilere eklemek için giriş yapmalısın");
      const already = isFavorited(listingType, listingId);
      if (already) {
        setFavorites((prev) => prev.filter((f) => !(f.listingType === listingType && f.listingId === listingId)));
        await authFetch(`/favorites/${listingType}/${listingId}`, { method: "DELETE" });
      } else {
        const optimistic: FavoriteDto = {
          id: `optimistic-${listingType}-${listingId}`,
          listingType,
          listingId,
          createdAt: new Date().toISOString(),
        };
        setFavorites((prev) => [optimistic, ...prev]);
        await authFetch("/favorites", {
          method: "POST",
          body: JSON.stringify({ listingType, listingId }),
        });
      }
      refresh();
    },
    [user, isFavorited, authFetch, refresh],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
