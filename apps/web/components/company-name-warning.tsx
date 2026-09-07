"use client";

import { useEffect, useRef, useState } from "react";
import { CompanyNameSuggestion } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";

/**
 * Piyasa dizininin parçalanmasını önlemek için sisteme kayıtlı benzer isimli
 * firmalar hakkında bilgilendirme yapar — asla engellemez, sadece uyarır.
 */
export function CompanyNameWarning({ name }: { name: string }) {
  const [suggestions, setSuggestions] = useState<CompanyNameSuggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch<CompanyNameSuggestion[]>(
          `/taxonomy/company-name-suggestions?name=${encodeURIComponent(trimmed)}`,
        );
        setSuggestions(res);
      } catch {
        setSuggestions([]);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name]);

  if (suggestions.length === 0) return null;

  return (
    <p className="text-xs text-amber-400">
      Sistemde benzer isimli firma(lar) var: {suggestions.map((s) => s.name).join(", ")} — aynı firma değilseniz göz
      ardı edebilirsin.
    </p>
  );
}
