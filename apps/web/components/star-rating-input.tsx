"use client";

/** Yorum formunda 1-5 arası tıklanabilir yıldız seçici. */
export function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} yıldız`}
          className={`text-2xl leading-none ${star <= value ? "text-gold-400" : "text-ink-700"} hover:text-gold-400`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
