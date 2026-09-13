"use client";

import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinin üstünde, sekmeden bağımsız her zaman görünen salt-okunur hesap özeti. */
export function AccountInfoCard({
  email,
  accountCreatedAt,
  isCorporate,
}: {
  email: string;
  accountCreatedAt: string;
  isCorporate: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg border border-ink-800 bg-ink-900 p-4 text-sm">
      <div>
        <span className="text-silver-500">{t("accountPanel.accountType")}: </span>
        <span className="text-silver-300">
          {isCorporate ? t("accountPanel.accountTypeCorporate") : t("accountPanel.accountTypeIndividual")}
        </span>
      </div>
      <div>
        <span className="text-silver-500">{t("accountPanel.email")}: </span>
        <span className="text-silver-300">{email}</span>
      </div>
      <div>
        <span className="text-silver-500">{t("accountPanel.memberSince")}: </span>
        <span className="text-silver-300">{new Date(accountCreatedAt).toLocaleDateString("tr-TR")}</span>
      </div>
    </div>
  );
}
