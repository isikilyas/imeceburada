"use client";

import { useEffect, useRef, useState } from "react";
import { TaxonomySuggestResponse, TaxonomyTermType } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { inputClass } from "@/components/form";

interface CustomTermInputProps {
  type: TaxonomyTermType;
  onAdd: (value: string) => void;
  placeholder?: string;
}

/**
 * Serbest metin girişi + "bunu mu demek istediniz?" önerisi — kapalı listede
 * bulunmayan meslek/malzeme/ekipman terimleri için. Asla engellemez: kullanıcı
 * önerilen bir terimi seçebilir ya da kendi yazdığıyla ısrar edebilir; ikisi de
 * eklenir, sunucu tarafı eşleşmeyeni onay kuyruğuna (PENDING) alır.
 */
export function CustomTermInput({ type, onAdd, placeholder }: CustomTermInputProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TaxonomySuggestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      return;
    }
    setIsLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch<TaxonomySuggestResponse>(
          `/taxonomy/suggest?type=${type}&q=${encodeURIComponent(query.trim())}`,
        );
        setResult(res);
      } catch {
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, type]);

  function commit(value: string) {
    onAdd(value);
    setQuery("");
    setResult(null);
  }

  const hasSuggestions = !isLoading && !!result && !result.exactMatch && result.suggestions.length > 0;
  const isNewTerm = !isLoading && !!result && !result.exactMatch;

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? "Listede yoksa kendi terimini yaz"}
        className={inputClass}
      />
      {isLoading && <p className="text-xs text-silver-500">Kontrol ediliyor...</p>}
      {hasSuggestions && (
        <div className="space-y-1.5 rounded-md border border-ink-700 bg-ink-900 p-2">
          <p className="text-xs text-silver-500">Bunu mu demek istediniz?</p>
          <div className="flex flex-wrap gap-1.5">
            {result!.suggestions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => commit(s.value)}
                className="rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400 hover:bg-ink-700"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => commit(query.trim())}
        disabled={!query.trim()}
        className="w-full rounded-md border border-ink-700 py-2 text-sm font-medium text-silver-300 hover:border-gold-500 hover:text-gold-400 disabled:opacity-50"
      >
        {hasSuggestions ? `"${query.trim()}" ile devam et` : "Bu terimi ekle"}
      </button>
      {isNewTerm && (
        <p className="text-xs text-silver-500">
          Bu terim listede yok — eklersen ilanın hemen yayınlanır, terim ayrıca onay için gönderilir.
        </p>
      )}
    </div>
  );
}
