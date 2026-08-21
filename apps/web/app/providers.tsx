"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { FavoritesProvider } from "@/lib/favorites-context";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <LocaleProvider>
        <AuthProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
