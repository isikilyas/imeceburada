export interface ReviewDto {
  id: string;
  applicationId: string;
  authorId: string;
  /** İsteği yapan kullanıcı açısından — kendi yazdığı yorum mu. */
  isMine: boolean;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

export interface ReviewSummaryDto {
  averageRating: number | null;
  reviewCount: number;
}
