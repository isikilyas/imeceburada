"use client";

/** Salt-okunur yıldız gösterimi — ortalama puan + yorum sayısı. averageRating null/yorum yoksa hiçbir şey göstermez. */
export function StarRating({
  averageRating,
  reviewCount,
  size = "sm",
}: {
  averageRating?: number | null;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  if (!averageRating || !reviewCount) return null;
  const rounded = Math.round(averageRating);
  const starSize = size === "md" ? "text-base" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1 ${starSize}`}>
      <span className="text-gold-400" aria-hidden>
        {"★".repeat(rounded)}
        <span className="text-ink-700">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-silver-500">
        {averageRating.toFixed(1)} ({reviewCount})
      </span>
    </span>
  );
}
