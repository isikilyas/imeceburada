"use client";

import { useLocale } from "@/lib/i18n/locale-context";

interface PhoneCallButtonProps {
  phone: string;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
}

/**
 * Bir kişiyi tek dokunuşla aramaya davet eden buton — sahada hızlı iletişim için.
 * WhatsAppContactButton'daki gibi href'i statik render ETMEZ, numara sayfa
 * kaynağında (view-source, scraping) açığa çıkmasın diye tıklama anında hesaplanır.
 */
export function PhoneCallButton({ phone, disabled = false, disabledLabel, className }: PhoneCallButtonProps) {
  const { t } = useLocale();

  if (disabled) {
    return (
      <span
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-md border border-ink-800 px-3 py-1.5 text-sm text-silver-500"
        }
      >
        🔴 {disabledLabel ?? t("components.phoneCallButton.unavailable")}
      </span>
    );
  }

  function handleClick() {
    window.location.href = `tel:${phone}`;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md bg-gold-500 px-3 py-1.5 text-sm font-medium text-ink-950 transition hover:bg-gold-400"
      }
    >
      📞 {t("components.phoneCallButton.call")}
    </button>
  );
}
