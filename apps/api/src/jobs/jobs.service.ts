import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CANDIDATE_LISTING_TYPES, JobMatchDto, ListingIntent } from "@imeceburada/shared";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { TaxonomyService } from "../taxonomy/taxonomy.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { SearchJobsDto } from "./dto/search-jobs.dto";

/** Puanlanan havuzu makul boyutta tutmak için — sıralama sonrası zaten en iyi MAX_MATCH_RESULTS gösterilir. */
const MATCH_CANDIDATE_POOL_SIZE = 50;
const MAX_MATCH_RESULTS = 20;

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private taxonomyService: TaxonomyService,
  ) {}

  async search(query: SearchJobsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where = {
      status: "ACTIVE" as const,
      company: { user: { deactivatedAt: null } },
      ...(query.listingType ? { listingType: query.listingType } : {}),
      ...(query.tradeCategory ? { tradeCategory: query.tradeCategory } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.district ? { district: query.district } : {}),
      ...(query.employmentType ? { employmentType: query.employmentType } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { description: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        include: { company: true },
        orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    const reviewByUserId = await this.getReviewSummariesByUserId(items.map((i) => i.company.userId));
    return {
      items: items.map((item) => ({
        ...this.toDto(item),
        ...(reviewByUserId.get(item.company.userId) ?? { averageRating: null, reviewCount: 0 }),
      })),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: { company: { include: { user: true } } },
    });
    if (!job || job.company.user.deactivatedAt) throw new NotFoundException("İlan bulunamadı");

    const reviewAggregate = await this.prisma.review.aggregate({
      where: { targetUserId: job.company.userId },
      _avg: { rating: true },
      _count: true,
    });
    return { ...this.toDto(job), averageRating: reviewAggregate._avg.rating, reviewCount: reviewAggregate._count };
  }

  /** Birden fazla firma için tek sorguda ortalama puan/yorum sayısı — arama sonuçlarında N+1 sorgu yapmamak için. */
  private async getReviewSummariesByUserId(
    userIds: string[],
  ): Promise<Map<string, { averageRating: number | null; reviewCount: number }>> {
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length === 0) return new Map();

    const groups = await this.prisma.review.groupBy({
      by: ["targetUserId"],
      where: { targetUserId: { in: uniqueUserIds } },
      _avg: { rating: true },
      _count: true,
    });
    return new Map(groups.map((g) => [g.targetUserId, { averageRating: g._avg.rating, reviewCount: g._count }]));
  }

  async findMine(user: RequestUser) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const jobs = await this.prisma.jobPosting.findMany({
      where: { companyId },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
    return jobs.map(this.toDto);
  }

  async create(user: RequestUser, dto: CreateJobDto) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const tradeCategory = await this.taxonomyService.resolveOrQueueTerm(
      "TRADE_PROFESSION",
      dto.tradeCategory,
      user.id,
    );
    const job = await this.prisma.jobPosting.create({
      data: { ...dto, tradeCategory, companyId },
      include: { company: true },
    });
    return this.toDto(job);
  }

  async update(user: RequestUser, id: string, dto: UpdateJobDto) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    if (job.companyId !== companyId) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    const tradeCategory = dto.tradeCategory
      ? await this.taxonomyService.resolveOrQueueTerm("TRADE_PROFESSION", dto.tradeCategory, user.id)
      : undefined;
    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: { ...dto, ...(tradeCategory ? { tradeCategory } : {}) },
      include: { company: true },
    });
    return this.toDto(updated);
  }

  async remove(user: RequestUser, id: string) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    if (job.companyId !== companyId) throw new ForbiddenException("Bu ilanı silme yetkiniz yok");

    await this.prisma.jobPosting.update({ where: { id }, data: { status: "CLOSED" } });
    return { success: true };
  }

  /**
   * Kural tabanlı eşleştirme — ilanın tradeCategory'siyle aynı meslekteki
   * aday/taşeron havuzunu şehir/ilçe, müsaitlik, deneyim ve puan gibi
   * sinyallere göre 0-100 arası skorlayıp sıralar. Dış bir AI servisi
   * kullanmaz, sonuç anında ve açıklanabilir (her eşleşme "neden" etiketleriyle gelir).
   */
  async getMatches(user: RequestUser, jobId: string): Promise<JobMatchDto[]> {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const job = await this.prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    if (job.companyId !== companyId) throw new ForbiddenException("Bu ilanın eşleşmelerini görme yetkiniz yok");

    const existingApplications = await this.prisma.application.findMany({
      where: { jobId },
      select: { candidateId: true, subcontractorId: true },
    });
    const appliedIds = new Set(existingApplications.map((a) => a.candidateId ?? a.subcontractorId));

    const isCandidateListing = CANDIDATE_LISTING_TYPES.includes(job.listingType as ListingIntent);

    if (isCandidateListing) {
      const candidates = await this.prisma.candidateProfile.findMany({
        where: { isPublic: true, user: { deactivatedAt: null }, primaryTradeCategory: job.tradeCategory },
        take: MATCH_CANDIDATE_POOL_SIZE,
      });
      const reviewByUserId = await this.getReviewSummariesByUserId(candidates.map((c) => c.userId));
      return candidates
        .map((c) => this.scoreCandidate(job, c, reviewByUserId.get(c.userId), appliedIds.has(c.id)))
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_MATCH_RESULTS);
    }

    const subcontractors = await this.prisma.subcontractorProfile.findMany({
      where: { isPublic: true, user: { deactivatedAt: null }, tradeCategories: { has: job.tradeCategory } },
      take: MATCH_CANDIDATE_POOL_SIZE,
    });
    const reviewByUserId = await this.getReviewSummariesByUserId(subcontractors.map((s) => s.userId));
    return subcontractors
      .map((s) => this.scoreSubcontractor(job, s, reviewByUserId.get(s.userId), appliedIds.has(s.id)))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_MATCH_RESULTS);
  }

  private scoreCandidate(
    job: { city: string; district: string | null },
    candidate: {
      id: string;
      userId: string;
      fullName: string;
      city: string;
      district: string | null;
      experienceYears: number;
      availabilityStatus: string;
    },
    reviewSummary: { averageRating: number | null; reviewCount: number } | undefined,
    alreadyApplied: boolean,
  ): JobMatchDto {
    let score = 0;
    const reasons: string[] = [];

    if (candidate.city === job.city) {
      score += 40;
      reasons.push("Aynı şehir");
      if (job.district && candidate.district === job.district) {
        score += 10;
        reasons.push("Aynı ilçe");
      }
    }
    if (candidate.availabilityStatus === "AVAILABLE") {
      score += 20;
      reasons.push("Şu an müsait");
    }
    if (candidate.experienceYears > 0) {
      score += Math.min(candidate.experienceYears, 10) * 1.5;
      reasons.push(`${candidate.experienceYears} yıl deneyim`);
    }
    if (reviewSummary?.averageRating) {
      score += (reviewSummary.averageRating / 5) * 15;
      reasons.push(`${reviewSummary.averageRating.toFixed(1)} ortalama puan (${reviewSummary.reviewCount} değerlendirme)`);
    }

    return {
      applicantType: "CANDIDATE",
      id: candidate.id,
      name: candidate.fullName,
      city: candidate.city,
      district: candidate.district,
      score: Math.round(score),
      reasons,
      alreadyApplied,
      experienceYears: candidate.experienceYears,
      availabilityStatus: candidate.availabilityStatus,
      averageRating: reviewSummary?.averageRating ?? null,
      reviewCount: reviewSummary?.reviewCount ?? 0,
    };
  }

  private scoreSubcontractor(
    job: { city: string; district: string | null },
    subcontractor: {
      id: string;
      userId: string;
      companyName: string;
      city: string;
      district: string | null;
      description: string | null;
      isPremium: boolean;
    },
    reviewSummary: { averageRating: number | null; reviewCount: number } | undefined,
    alreadyApplied: boolean,
  ): JobMatchDto {
    let score = 0;
    const reasons: string[] = [];

    if (subcontractor.city === job.city) {
      score += 40;
      reasons.push("Aynı şehir");
      if (job.district && subcontractor.district === job.district) {
        score += 10;
        reasons.push("Aynı ilçe");
      }
    }
    if (reviewSummary?.averageRating) {
      score += (reviewSummary.averageRating / 5) * 25;
      reasons.push(`${reviewSummary.averageRating.toFixed(1)} ortalama puan (${reviewSummary.reviewCount} değerlendirme)`);
    }
    if (subcontractor.isPremium) {
      score += 15;
      reasons.push("Aktif üye");
    }
    if (subcontractor.description && subcontractor.description.trim().length > 20) {
      score += 10;
    }

    return {
      applicantType: "SUBCONTRACTOR",
      id: subcontractor.id,
      name: subcontractor.companyName,
      city: subcontractor.city,
      district: subcontractor.district,
      score: Math.round(score),
      reasons,
      alreadyApplied,
      averageRating: reviewSummary?.averageRating ?? null,
      reviewCount: reviewSummary?.reviewCount ?? 0,
    };
  }

  private toDto = (job: {
    id: string;
    companyId: string;
    title: string;
    listingType: string;
    tradeCategory: string;
    city: string;
    district: string | null;
    employmentType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    isUrgent: boolean;
    description: string;
    status: string;
    createdAt: Date;
    company: { companyName: string; phoneVerifiedAt: Date | null };
  }) => ({
    id: job.id,
    companyId: job.companyId,
    companyName: job.company.companyName,
    companyVerified: !!job.company.phoneVerifiedAt,
    title: job.title,
    listingType: job.listingType,
    tradeCategory: job.tradeCategory,
    city: job.city,
    district: job.district,
    employmentType: job.employmentType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    isUrgent: job.isUrgent,
    description: job.description,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
  });
}
