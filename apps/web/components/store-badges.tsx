"use client";

import { useLocale } from "@/lib/i18n/locale-context";

interface StoreBadgeProps {
  href: string;
  className?: string;
}

const badgeBase =
  "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-white/15 bg-black px-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:shadow-md sm:flex-initial sm:justify-start sm:gap-2 sm:px-3";
const iconClass = "h-5 w-5 shrink-0 sm:h-6 sm:w-6";
const textWrapClass = "min-w-0 truncate leading-tight";
const kickerClass = "block truncate text-[8px] font-normal tracking-wide text-white/85 sm:text-[9px]";
const titleClass = "-mt-0.5 block truncate text-xs font-semibold tracking-tight sm:text-[15px]";

/** Apple'ın resmi "Download on the App Store" rozetiyle aynı düzende, sade bir yeniden çizim. */
export function AppStoreBadge({ href, className = "" }: StoreBadgeProps) {
  const { t } = useLocale();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${badgeBase} ${className}`}>
      <svg viewBox="0 0 24 24" className={`${iconClass} fill-white`}>
        <path d="M17.05 12.536c-.02-2.09 1.708-3.09 1.785-3.14-.977-1.428-2.497-1.624-3.037-1.646-1.293-.132-2.523.762-3.178.762-.657 0-1.667-.744-2.744-.724-1.412.02-2.714.82-3.44 2.083-1.468 2.542-.375 6.31 1.055 8.373.7 1.01 1.532 2.145 2.626 2.105 1.055-.043 1.454-.681 2.73-.681 1.274 0 1.632.68 2.747.658 1.135-.02 1.854-1.03 2.55-2.045.804-1.172 1.135-2.307 1.153-2.366-.025-.011-2.213-.85-2.235-3.38l-.012.001z" />
        <path d="M14.964 6.16c.582-.705.975-1.685.867-2.66-.838.034-1.852.558-2.454 1.263-.54.622-1.013 1.62-.885 2.577.933.073 1.887-.474 2.472-1.18z" />
      </svg>
      <span className={textWrapClass}>
        <span className={kickerClass}>{t("components.storeBadges.appStore.kicker")}</span>
        <span className={titleClass}>{t("components.storeBadges.appStore.title")}</span>
      </span>
    </a>
  );
}

/** Google Play'in resmi rozetiyle aynı düzende, sade bir yeniden çizim. */
export function GooglePlayBadge({ href, className = "" }: StoreBadgeProps) {
  const { t } = useLocale();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${badgeBase} ${className}`}>
      <svg viewBox="0 0 24 24" className={iconClass}>
        <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1L13 12.5v-.1L3.7 2.2l-.1.1z" fill="#00D9FF" />
        <path d="M16.1 15.6l-3.1-3.1v-.1l3.1-3.1.1.1 3.7 2.1c1.1.6 1.1 1.6 0 2.2l-3.7 2.1-.1-.2z" fill="#FFCE00" />
        <path d="M16.2 15.5L13 12.4 3.6 21.8c.4.4 1 .4 1.7.1l10.9-6.4" fill="#FF3A44" />
        <path d="M16.2 9.3L5.3 3c-.7-.4-1.3-.3-1.7.1L13 12.4l3.2-3.1z" fill="#00D95F" />
      </svg>
      <span className={textWrapClass}>
        <span className={kickerClass}>{t("components.storeBadges.googlePlay.kicker")}</span>
        <span className={titleClass}>{t("components.storeBadges.googlePlay.title")}</span>
      </span>
    </a>
  );
}

/** Huawei AppGallery'nin resmi rozetiyle aynı düzende, sade bir yeniden çizim. */
export function AppGalleryBadge({ href, className = "" }: StoreBadgeProps) {
  const { t } = useLocale();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${badgeBase} ${className}`}>
      <svg viewBox="0 0 24 24" className={iconClass}>
        <path
          d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M8.4 8.6h7.2l-3.6 6.8-3.6-6.8z" fill="#C7000B" />
      </svg>
      <span className={textWrapClass}>
        <span className={kickerClass}>{t("components.storeBadges.appGallery.kicker")}</span>
        <span className={titleClass}>{t("components.storeBadges.appGallery.title")}</span>
      </span>
    </a>
  );
}
