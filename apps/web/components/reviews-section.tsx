"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReviewDto } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import { Field, inputClass } from "@/components/form";
import { StarRatingInput } from "@/components/star-rating-input";

interface ReviewsResponse {
  canReview: boolean;
  reviews: ReviewDto[];
}

/** Bir başvurunun mesaj dizisinde gösterilen yorum bölümü — mevcut yorumlar + (uygunsa) yorum bırakma formu. */
export function ReviewsSection({ applicationId }: { applicationId: string }) {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["application-reviews", applicationId],
    queryFn: () => authFetch<ReviewsResponse>(`/applications/${applicationId}/reviews`),
    enabled: !!applicationId,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch(`/applications/${applicationId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["application-reviews", applicationId] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("reviews.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!data) return null;

  return (
    <div className="space-y-3 rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="text-sm font-semibold text-silver-300">{t("reviews.heading")}</h2>

      {data.reviews.length === 0 && <p className="text-sm text-silver-500">{t("reviews.noReviewsYet")}</p>}
      {data.reviews.map((r) => (
        <div key={r.id} className="rounded-md border border-ink-800 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gold-400">{"★".repeat(r.rating)}<span className="text-ink-700">{"★".repeat(5 - r.rating)}</span></span>
            <span className="text-xs text-silver-500">{r.isMine ? t("reviews.yourReview") : t("reviews.theirReview")}</span>
          </div>
          {r.comment && <p className="mt-1 text-silver-300">{r.comment}</p>}
        </div>
      ))}

      {data.canReview && (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-ink-800 pt-3">
          <p className="text-xs text-silver-500">{t("reviews.leaveReviewHint")}</p>
          <Field label={t("reviews.ratingLabel")}>
            <StarRatingInput value={rating} onChange={setRating} />
          </Field>
          <Field label={t("reviews.commentLabel")}>
            <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass} />
          </Field>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? t("reviews.submittingButton") : t("reviews.submitButton")}
          </button>
        </form>
      )}
    </div>
  );
}
