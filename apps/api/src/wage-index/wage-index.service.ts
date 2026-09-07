import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TaxonomyService } from "../taxonomy/taxonomy.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateWageSubmissionDto } from "./dto/create-wage-submission.dto";
import { WageIndexQueryDto } from "./dto/wage-index-query.dto";
import { WAGE_INDEX_MIN_SAMPLE_SIZE, WageIndexPoint, WageScalePoint } from "@imeceburada/shared";

interface WageIndexRow {
  month: string;
  tradeCategory: string;
  city: string;
  district: string | null;
  employerAverage: number | null;
  employerSampleSize: number;
  jobseekerAverage: number | null;
  jobseekerSampleSize: number;
  medianAmount: number;
  sampleSize: number;
  expectationAverage: number | null;
  expectationSampleSize: number;
}

interface WageScaleRow {
  tradeCategory: string;
  city: string;
  district: string | null;
  period: string;
  minAmount: number;
  employerAverage: number | null;
  employerSampleSize: number;
  jobseekerAverage: number | null;
  jobseekerSampleSize: number;
  maxAmount: number;
  sampleSize: number;
  expectationAverage: number | null;
  expectationSampleSize: number;
}

/**
 * "Gerçekleşen/Ödenen" ve "Teklif/Beklenti" gönderimleri tek sorguda ayrı ayrı
 * agregeleyerek karışmalarını önler — bkz. WageIndexPoint/WageScalePoint dokümanı.
 * Gizlilik eşiği (HAVING) sadece ACTUAL örneklem sayısına uygulanır; endeksin
 * ana rakamı hep gerçek ödemelerden gelir, beklenti sadece ek bilgidir.
 */
function mapExpectation(average: number | null, sampleSize: number) {
  return sampleSize >= WAGE_INDEX_MIN_SAMPLE_SIZE && average !== null ? Math.round(average) : null;
}

/**
 * Piyasayı tek taraflı yansıtmamak için ortalama, iş verenlerin (Firma/
 * Taşeron) girdiği rakamların ortalaması ile iş arayanların (Aday) girdiği
 * rakamların ortalamasının ortalaması olarak hesaplanır (50/50 ağırlık).
 * Sadece bir taraftan veri varsa o tarafın ortalaması kullanılır.
 */
function combineEmployerAndJobseeker(employerAverage: number | null, jobseekerAverage: number | null): number {
  if (employerAverage !== null && jobseekerAverage !== null) return (employerAverage + jobseekerAverage) / 2;
  return employerAverage ?? jobseekerAverage ?? 0;
}

@Injectable()
export class WageIndexService {
  constructor(
    private prisma: PrismaService,
    private taxonomyService: TaxonomyService,
  ) {}

  private async getSubmitterPhone(user: RequestUser): Promise<string> {
    const profile =
      user.role === "CANDIDATE"
        ? await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } })
        : user.role === "COMPANY"
          ? await this.prisma.companyProfile.findUnique({ where: { userId: user.id } })
          : user.role === "SUPPLIER"
            ? await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } })
            : user.role === "SUBCONTRACTOR"
              ? await this.prisma.subcontractorProfile.findUnique({ where: { userId: user.id } })
              : null;
    if (!profile?.phone) {
      throw new BadRequestException("Bu işlem için profilinde kayıtlı bir telefon numarası olmalı");
    }
    return profile.phone;
  }

  async submit(user: RequestUser, dto: CreateWageSubmissionDto) {
    const phone = await this.getSubmitterPhone(user);
    const submissionMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const tradeCategory = await this.taxonomyService.resolveOrQueueTerm(
      "TRADE_PROFESSION",
      dto.tradeCategory,
      user.id,
    );
    try {
      const submission = await this.prisma.wageSubmission.create({
        data: { ...dto, tradeCategory, submittedById: user.id, phone, submissionMonth },
      });
      return { success: true, id: submission.id };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Bu meslek ve şehir için bu ay zaten veri girdin");
      }
      throw err;
    }
  }

  /**
   * İlçe seçilmişse o ilçenin ortalaması (district bazlı grupla); sadece il
   * seçilmişse o ile ait TÜM ilçelerin birleşik (il bazlı) ortalaması döner.
   */
  async getIndex(query: WageIndexQueryDto): Promise<WageIndexPoint[]> {
    const months = query.months ?? 6;
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const tradeCategory = query.tradeCategory ?? null;
    const city = query.city ?? null;
    const district = query.district ?? null;

    const rows = district
      ? await this.prisma.$queryRaw<WageIndexRow[]>`
          SELECT
            to_char(date_trunc('month', ws."createdAt"), 'YYYY-MM') as "month",
            ws."tradeCategory",
            ws."city",
            ws."district",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::float as "employerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::int as "employerSampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::float as "jobseekerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::int as "jobseekerSampleSize",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL')::float as "medianAmount",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions ws
          JOIN users u ON u.id = ws."submittedById"
          WHERE ws."createdAt" >= ${since}
            AND (${tradeCategory}::text IS NULL OR ws."tradeCategory" = ${tradeCategory})
            AND (${city}::text IS NULL OR ws."city" = ${city})
            AND ws."district" = ${district}
          GROUP BY "month", ws."tradeCategory", ws."city", ws."district"
          HAVING COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "month" ASC
        `
      : await this.prisma.$queryRaw<WageIndexRow[]>`
          SELECT
            to_char(date_trunc('month', ws."createdAt"), 'YYYY-MM') as "month",
            ws."tradeCategory",
            ws."city",
            NULL as "district",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::float as "employerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::int as "employerSampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::float as "jobseekerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::int as "jobseekerSampleSize",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL')::float as "medianAmount",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions ws
          JOIN users u ON u.id = ws."submittedById"
          WHERE ws."createdAt" >= ${since}
            AND (${tradeCategory}::text IS NULL OR ws."tradeCategory" = ${tradeCategory})
            AND (${city}::text IS NULL OR ws."city" = ${city})
          GROUP BY "month", ws."tradeCategory", ws."city"
          HAVING COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "month" ASC
        `;

    return rows.map((r: WageIndexRow) => ({
      month: r.month,
      tradeCategory: r.tradeCategory,
      city: r.city,
      district: r.district,
      averageAmount: Math.round(combineEmployerAndJobseeker(r.employerAverage, r.jobseekerAverage)),
      medianAmount: Math.round(r.medianAmount),
      sampleSize: r.sampleSize,
      expectationAverage: mapExpectation(r.expectationAverage, r.expectationSampleSize),
      expectationSampleSize: r.expectationSampleSize,
    }));
  }

  /**
   * "Maaş Pusulam" — belirli bir meslek + bölge (il veya ilçe) için son N aydaki
   * en düşük / ortalama / en yüksek ücreti, ödeme periyoduna göre gruplayarak döner.
   * tradeCategory ve city zorunludur; ikisi de verilmezse boş dizi döner.
   */
  async getScale(query: WageIndexQueryDto): Promise<WageScalePoint[]> {
    const { tradeCategory, city, district } = query;
    if (!tradeCategory || !city) return [];

    const months = query.months ?? 6;
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const rows = district
      ? await this.prisma.$queryRaw<WageScaleRow[]>`
          SELECT
            ws."tradeCategory",
            ws."city",
            ws."district",
            ws."period",
            MIN(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "minAmount",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::float as "employerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::int as "employerSampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::float as "jobseekerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::int as "jobseekerSampleSize",
            MAX(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "maxAmount",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions ws
          JOIN users u ON u.id = ws."submittedById"
          WHERE ws."createdAt" >= ${since}
            AND ws."tradeCategory" = ${tradeCategory}
            AND ws."city" = ${city}
            AND ws."district" = ${district}
          GROUP BY ws."tradeCategory", ws."city", ws."district", ws."period"
          HAVING COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY ws."period" ASC
        `
      : await this.prisma.$queryRaw<WageScaleRow[]>`
          SELECT
            ws."tradeCategory",
            ws."city",
            NULL as "district",
            ws."period",
            MIN(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "minAmount",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::float as "employerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::int as "employerSampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::float as "jobseekerAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::int as "jobseekerSampleSize",
            MAX(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "maxAmount",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE ws."submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions ws
          JOIN users u ON u.id = ws."submittedById"
          WHERE ws."createdAt" >= ${since}
            AND ws."tradeCategory" = ${tradeCategory}
            AND ws."city" = ${city}
          GROUP BY ws."tradeCategory", ws."city", ws."period"
          HAVING COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY ws."period" ASC
        `;

    return rows.map((r: WageScaleRow) => ({
      tradeCategory: r.tradeCategory,
      city: r.city,
      district: r.district,
      period: r.period as WageScalePoint["period"],
      minAmount: r.minAmount,
      averageAmount: Math.round(combineEmployerAndJobseeker(r.employerAverage, r.jobseekerAverage)),
      maxAmount: r.maxAmount,
      sampleSize: r.sampleSize,
      expectationAverage: mapExpectation(r.expectationAverage, r.expectationSampleSize),
      expectationSampleSize: r.expectationSampleSize,
    }));
  }
}
