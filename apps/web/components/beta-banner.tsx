"use client";

import { useLocale } from "@/lib/i18n/locale-context";

/** Erken Erişim/Beta dönemi boyunca kurumsal panellerde ve üyelik sayfasında gösterilir. */
export function BetaBanner() {
  const { t } = useLocale();
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-3">
      <span className="text-lg">🎉</span>
      <p className="text-sm font-medium text-gold-300">{t("common.betaBanner")}</p>
    </div>
  );
}
