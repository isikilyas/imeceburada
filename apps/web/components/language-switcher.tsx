"use client";

import { useState } from "react";
import { AVAILABLE_LOCALES, COMING_SOON_LOCALES, useLocale } from "@/lib/i18n/locale-context";
import { FlagIcon } from "@/components/flag-icon";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const current = AVAILABLE_LOCALES.find((l) => l.code === locale) ?? AVAILABLE_LOCALES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-silver-300 hover:text-gold-400"
      >
        <FlagIcon code={current.flagCode} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-xs text-silver-500">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full z-50 mt-2 w-48 rounded-md border border-ink-700 bg-ink-900 py-1 shadow-lg">
            {AVAILABLE_LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-ink-800 ${
                  l.code === locale ? "text-gold-400" : "text-silver-300"
                }`}
              >
                <FlagIcon code={l.flagCode} /> {l.label}
              </button>
            ))}
            {COMING_SOON_LOCALES.length > 0 && <div className="my-1 border-t border-ink-800" />}
            {COMING_SOON_LOCALES.map((l) => (
              <div
                key={l.code}
                className="flex w-full cursor-not-allowed items-center gap-2 px-3 py-2 text-sm text-silver-500"
              >
                <FlagIcon code={l.flagCode} /> {l.label}
                <span className="ml-auto text-[10px]">Yakında</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
