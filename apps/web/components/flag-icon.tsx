export type FlagCode = "tr" | "gb" | "de" | "ru" | "sa";

/**
 * Ülke bayrakları emoji olarak Windows'ta genellikle "TR"/"GB" gibi harf
 * çiftlerine düşüyor (emoji font'unda bayrak ligatürü yoksa) — bu yüzden gerçek
 * bayrak ikonlarını basit inline SVG olarak çiziyoruz, platformdan bağımsız.
 */
export function FlagIcon({ code, className = "h-3.5 w-5" }: { code: FlagCode; className?: string }) {
  const common = "shrink-0 rounded-[2px] ring-1 ring-inset ring-black/15";

  switch (code) {
    case "tr":
      return (
        <svg viewBox="0 0 30 20" className={`${common} ${className}`} aria-hidden="true">
          <rect width="30" height="20" fill="#E30A17" />
          <circle cx="12" cy="10" r="5.5" fill="#fff" />
          <circle cx="13.3" cy="10" r="4.4" fill="#E30A17" />
          <path fill="#fff" d="M18 10l4.9-1.6-3 4.2V7.4l3 4.2z" />
        </svg>
      );
    case "gb":
      return (
        <svg viewBox="0 0 30 20" className={`${common} ${className}`} aria-hidden="true">
          <rect width="30" height="20" fill="#012169" />
          <path stroke="#fff" strokeWidth="4" d="M0 0l30 20M30 0L0 20" />
          <path stroke="#C8102E" strokeWidth="1.5" d="M0 0l30 20M30 0L0 20" />
          <path stroke="#fff" strokeWidth="6.5" d="M15 0v20M0 10h30" />
          <path stroke="#C8102E" strokeWidth="4" d="M15 0v20M0 10h30" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 30 20" className={`${common} ${className}`} aria-hidden="true">
          <rect width="30" height="6.67" fill="#000" />
          <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
          <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
        </svg>
      );
    case "ru":
      return (
        <svg viewBox="0 0 30 20" className={`${common} ${className}`} aria-hidden="true">
          <rect width="30" height="6.67" fill="#fff" />
          <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
          <rect y="13.33" width="30" height="6.67" fill="#D52B1E" />
        </svg>
      );
    case "sa":
      return (
        <svg viewBox="0 0 30 20" className={`${common} ${className}`} aria-hidden="true">
          <rect width="30" height="20" fill="#006C35" />
        </svg>
      );
  }
}
