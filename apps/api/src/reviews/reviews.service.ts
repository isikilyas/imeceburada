import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(user: RequestUser, applicationId: string, dto: CreateReviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: { include: { company: true } } },
    });
    if (!application) throw new NotFoundException("Başvuru bulunamadı");

    const isCandidate = application.candidate.userId === user.id;
    const isCompany = application.job.company.userId === user.id;
    if (!isCandidate && !isCompany) throw new ForbiddenException("Bu başvuruya yorum bırakamazsınız");

    if (application.status !== "ACCEPTED") {
      throw new BadRequestException("Sadece kabul edilmiş başvurulara yorum bırakılabilir");
    }

    const targetUserId = isCandidate ? application.job.company.userId : application.candidate.userId;

    const existing = await this.prisma.review.findUnique({
      where: { applicationId_authorId: { applicationId, authorId: user.id } },
    });
    if (existing) throw new ConflictException("Bu başvuru için zaten bir yorum bıraktınız");

    const review = await this.prisma.review.create({
      data: { applicationId, authorId: user.id, targetUserId, rating: dto.rating, comment: dto.comment },
    });
    return this.toReviewDto(review, user.id);
  }

  async listReviewsForApplication(user: RequestUser, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: { include: { company: true } } },
    });
    if (!application) throw new NotFoundException("Başvuru bulunamadı");

    const isCandidate = application.candidate.userId === user.id;
    const isCompany = application.job.company.userId === user.id;
    if (!isCandidate && !isCompany) throw new ForbiddenException("Bu başvurunun yorumlarına erişemezsiniz");

    const reviews = await this.prisma.review.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    });
    return {
      canReview: application.status === "ACCEPTED" && !reviews.some((r) => r.authorId === user.id),
      reviews: reviews.map((r) => this.toReviewDto(r, user.id)),
    };
  }

  /** Herkese açık — bir kullanıcının aldığı yorumların ortalaması ve sayısı, profil/ilan kartlarında gösterilir. */
  async getUserReviewSummary(userId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: { targetUserId: userId },
      _avg: { rating: true },
      _count: true,
    });
    return {
      averageRating: aggregate._avg.rating,
      reviewCount: aggregate._count,
    };
  }

  private toReviewDto(
    review: { id: string; applicationId: string; authorId: string; rating: number; comment: string | null; createdAt: Date },
    currentUserId: string,
  ) {
    return {
      id: review.id,
      applicationId: review.applicationId,
      authorId: review.authorId,
      isMine: review.authorId === currentUserId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
