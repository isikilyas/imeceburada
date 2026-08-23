"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n/locale-context";

export default function MarketplaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLocale();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-5xl">⚠️</p>
      <div>
        <h1 className="text-xl font-semibold text-silver-200">{t("misc.error.heading")}</h1>
        <p className="mt-2 max-w-sm text-sm text-silver-500">
          {t("misc.error.description")}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-md bg-gold-500 px-6 py-3 font-medium text-ink-950 transition hover:bg-gold-400"
      >
        {t("misc.error.retry")}
      </button>
    </div>
  );
}
