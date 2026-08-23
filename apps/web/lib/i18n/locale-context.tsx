"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Locale, translations } from "./translations";
import { FlagCode } from "@/components/flag-icon";

export const AVAILABLE_LOCALES: { code: Locale; label: string; flagCode: FlagCode }[] = [
  { code: "tr", label: "Türkçe", flagCode: "tr" },
  { code: "en", label: "English", flagCode: "gb" },
  { code: "de", label: "Deutsch", flagCode: "de" },
  { code: "ru", label: "Русский", flagCode: "ru" },
  { code: "ar", label: "العربية", flagCode: "sa" },
  { code: "es", label: "Español", flagCode: "es" },
  { code: "fr", label: "Français", flagCode: "fr" },
];

/** Henüz çevrilmemiş diller — seçici bunları listeler ama tıklanamaz, gösterge amaçlı. */
export const COMING_SOON_LOCALES: { code: string; label: string; flagCode: FlagCode }[] = [];

const LOCALE_CODES = AVAILABLE_LOCALES.map((l) => l.code);

/** Sağdan sola yazılan diller — <html dir> bu listeye göre senkronize edilir. */
const RTL_LOCALES: Locale[] = ["ar"];

const STORAGE_KEY = "bau360-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getNested(dict: unknown, path: string): string | undefined {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict) as string | undefined;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALE_CODES as string[]).includes(stored)) setLocaleState(stored as Locale);
  }, []);

  useEffect(() => {
    // CSS text-transform: uppercase is locale-aware (Turkish "i" -> "İ") — keep
    // <html lang> in sync so non-Turkish text doesn't get Turkish casing rules.
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  function t(path: string, vars?: Record<string, string | number>): string {
    const raw = getNested(translations[locale], path) ?? path;
    if (!vars) return raw;
    return raw.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}