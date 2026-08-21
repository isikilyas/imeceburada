"use client";

import { toWhatsAppPhone } from "@/lib/phone";

interface WhatsAppContactButtonProps {
  phone: string;
  message: string;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
}

/**
 * Bir kişiyi WhatsApp üzerinden doğrudan iletişime geçmeye davet eden buton —
 * WhatsAppShareButton'dan farklı: bir sohbeti paylaşmaz, doğrudan o numarayla
 * hazır mesajlı bir sohbet açar (wa.me/<numara>?text=...).
 *
 * href'i statik olarak render ETMEZ — gerçek numara sayfa kaynağında (view-source,
 * scraping) görünmesin diye onClick anında hesaplanır. Görünen metin zaten maskeli
 * olsa da statik bir href numarayı DOM'da açığa çıkarırdı.
 */
export function WhatsAppContactButton({
  phone,
  message,
  disabled = false,
  disabledLabel = "Şu an müsait değil",
  className,
}: WhatsAppContactButtonProps) {
  if (disabled) {
    return (
      <span
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-md border border-ink-800 px-3 py-1.5 text-sm text-silver-500"
        }
      >
        🔴 {disabledLabel}
      </span>
    );
  }

  function handleClick() {
    const url = `https://wa.me/${toWhatsAppPhone(phone)}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-500"
      }
    >
      💬 WhatsApp ile İletişime Geç
    </button>
  );
}