export type WeatherKind = "clear" | "partly-cloudy" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm";

export function weatherKindFromCode(code: number): WeatherKind {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

const LABELS: Record<WeatherKind, string> = {
  clear: "Açık",
  "partly-cloudy": "Parçalı bulutlu",
  cloudy: "Kapalı",
  fog: "Sisli",
  drizzle: "Çisenti",
  rain: "Yağmurlu",
  snow: "Kar yağışlı",
  storm: "Gök gürültülü fırtına",
};

export function weatherLabel(kind: WeatherKind): string {
  return LABELS[kind];
}

/** Sade, tek renkli (currentColor) çizim ikonları — emoji yerine platformlar arası tutarlı görünüm için. */
export function WeatherIcon({ kind, className = "h-7 w-7" }: { kind: WeatherKind; className?: string }) {
  switch (kind) {
    case "clear":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5M18.4 18.4l-1.5-1.5M7.1 7.1L5.6 5.6" />
          </g>
        </svg>
      );
    case "partly-cloudy":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="9" cy="9" r="4" fill="currentColor" opacity="0.85" />
          <path
            d="M7.5 19.5h9.5a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.2 13.5a3.75 3.75 0 0 0 1.3 6z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      );
    case "cloudy":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            d="M6.5 18.5h11a4 4 0 0 0 .6-7.95 6 6 0 0 0-11.6 1.6A3.75 3.75 0 0 0 6.5 18.5z"
            fill="currentColor"
            opacity="0.75"
          />
        </svg>
      );
    case "fog":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            d="M6.5 13h11a4 4 0 0 0 .3-7.98A6 6 0 0 0 6.4 6.9 3.75 3.75 0 0 0 6.5 13z"
            fill="currentColor"
            opacity="0.65"
          />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 16.5h16M4 20h12" />
          </g>
        </svg>
      );
    case "drizzle":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            d="M6.5 11.5h11a4 4 0 0 0 .3-7.98A6 6 0 0 0 6.4 5.4 3.75 3.75 0 0 0 6.5 11.5z"
            fill="currentColor"
            opacity="0.75"
          />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M8.5 15.5v3M12.5 15.5v3M16.5 15.5v3" opacity="0.6" />
          </g>
        </svg>
      );
    case "rain":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            d="M6.5 11h11a4 4 0 0 0 .3-7.98A6 6 0 0 0 6.4 4.9 3.75 3.75 0 0 0 6.5 11z"
            fill="currentColor"
            opacity="0.8"
          />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M8 14.5l-1.5 4M13 14.5l-1.5 4M18 14.5l-1.5 4" />
          </g>
        </svg>
      );
    case "snow":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            d="M6.5 10.5h11a4 4 0 0 0 .3-7.98A6 6 0 0 0 6.4 4.4 3.75 3.75 0 0 0 6.5 10.5z"
            fill="currentColor"
            opacity="0.75"
          />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M8 14v6M5.3 15.5l5.4 3M13 14v6M10.3 20l5.4-3M18 14v6M15.3 15.5l5.4 3" opacity="0.7" />
          </g>
        </svg>
      );
    case "storm":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path
            d="M6.5 10.5h10a3.9 3.9 0 0 0 .3-7.78A5.9 5.9 0 0 0 6.4 4.4 3.7 3.7 0 0 0 6.5 10.5z"
            fill="currentColor"
            opacity="0.7"
          />
          <path d="M13 13l-3.2 5h2.4l-1.6 4.5 4.8-6h-2.6l1.9-3.5H13z" fill="currentColor" />
        </svg>
      );
  }
}
