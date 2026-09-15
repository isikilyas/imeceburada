"use client";

import { useLocale } from "@/lib/i18n/locale-context";

/** Hesabım panelinin üstünde, sekmeden bağımsız her zaman görünen profil özeti kartı. */
export function AccountInfoCard({
  email,
  accountCreatedAt,
  lastLoginAt,
  pendingEmail,
  isCorporate,
}: {
  email: string;
  accountCreatedAt: string;
  lastLoginAt?: string | null;
  pendingEmail?: string | null;
  isCorporate: boolean;
}) {
  const { t } = useLocale();
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900 to-ink-950 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xl font-semibold text-ink-950">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-silver-300">{email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-ink-700 px-2.5 py-0.5 text-xs text-silver-400">
              {isCorporate ? t("accountPanel.accountTypeCorporate") : t("accountPanel.accountTypeIndividual")}
            </span>
            {pendingEmail ? (
              <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                {t("accountPanel.emailStatusPending", { email: pendingEmail })}
              </span>
            ) : (
              <span className="rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                {t("accountPanel.emailStatusVerified")}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-ink-800 pt-4 text-xs text-silver-500">
        <span>
          {t("accountPanel.memberSince")}: {new Date(accountCreatedAt).toLocaleDateString("tr-TR")}
        </span>
        {lastLoginAt && (
          <span>
            {t("accountPanel.lastLoginAt")}: {new Date(lastLoginAt).toLocaleString("tr-TR")}
          </span>
        )}
      </div>
    </div>
  );
}
