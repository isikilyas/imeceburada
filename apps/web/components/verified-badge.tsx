"use client";

import { useLocale } from "@/lib/i18n/locale-context";

export function VerifiedBadge({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  return (
    <span
      title={t("formComponents.verifiedBadge.title")}
      aria-label={t("formComponents.verifiedBadge.title")}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-gold-400">
        <path d="M12 1.5l2.6 1.5 3-.4 1.1 2.8 2.8 1.1-.4 3 1.5 2.6-1.5 2.6.4 3-2.8 1.1-1.1 2.8-3-.4L12 22.5l-2.6-1.5-3 .4-1.1-2.8-2.8-1.1.4-3L1.5 12l1.5-2.6-.4-3 2.8-1.1L6.5 2.5l3 .4L12 1.5Z" />
        <path
          d="M8.5 12.3l2.3 2.3 4.7-4.9"
          fill="none"
          stroke="#1a1e26"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
