"use client";

import { useLocale } from "@/lib/i18n/locale-context";

interface WhatsAppShareButtonProps {
  text: string;
  className?: string;
}

/**
 * wa.me linkini tıklama anında window.location.href ile oluşturur — SSR/hydration
 * sorunlarından kaçınmak için href statik değil, onClick içinde hesaplanır.
 */
export function WhatsAppShareButton({ text, className }: WhatsAppShareButtonProps) {
  const { t } = useLocale();

  function handleShare() {
    const message = `${text} ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-green-500 hover:text-green-400"
      }
    >
      <span>💬</span> {t("components.whatsappShareButton.share")}
    </button>
  );
}