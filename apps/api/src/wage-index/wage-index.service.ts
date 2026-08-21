import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateWageSubmissionDto } from "./dto/create-wage-submission.dto";
import { WageIndexQueryDto } from "./dto/wage-index-query.dto";
import { WAGE_INDEX_MIN_SAMPLE_SIZE, WageIndexPoint, WageScalePoint } from "@bau360/shared";

interface WageIndexRow {
  month: string;
  tradeCategory: string;
  city: string;
  district: string | null;
  averageAmount: number;
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
  averageAmount: number;
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

@Injectable()
export class WageIndexService {
  constructor(private prisma: PrismaService) {}

  async submit(user: RequestUser, dto: CreateWageSubmissionDto) {
    const submission = await this.prisma.wageSubmission.create({
      data: { ...dto, submittedById: user.id },
    });
    return { success: true, id: submission.id };
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
            to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as "month",
            "tradeCategory",
            "city",
            "district",
            AVG(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "averageAmount",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "medianAmount",
            COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(amount) FILTER (WHERE "submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE "submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions
          WHERE "createdAt" >= ${since}
            AND (${tradeCategory}::text IS NULL OR "tradeCategory" = ${tradeCategory})
            AND (${city}::text IS NULL OR "city" = ${city})
            AND "district" = ${district}
          GROUP BY "month", "tradeCategory", "city", "district"
          HAVING COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "month" ASC
        `
      : await this.prisma.$queryRaw<WageIndexRow[]>`
          SELECT
            to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as "month",
            "tradeCategory",
            "city",
            NULL as "district",
            AVG(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "averageAmount",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "medianAmount",
            COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(amount) FILTER (WHERE "submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE "submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions
          WHERE "createdAt" >= ${since}
            AND (${tradeCategory}::text IS NULL OR "tradeCategory" = ${tradeCategory})
            AND (${city}::text IS NULL OR "city" = ${city})
          GROUP BY "month", "tradeCategory", "city"
          HAVING COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "month" ASC
        `;

    return rows.map((r) => ({
      month: r.month,
      tradeCategory: r.tradeCategory,
      city: r.city,
      district: r.district,
      averageAmount: Math.round(r.averageAmount),
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
            "tradeCategory",
            "city",
            "district",
            "period",
            MIN(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "minAmount",
            AVG(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "averageAmount",
            MAX(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "maxAmount",
            COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(amount) FILTER (WHERE "submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE "submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions
          WHERE "createdAt" >= ${since}
            AND "tradeCategory" = ${tradeCategory}
            AND "city" = ${city}
            AND "district" = ${district}
          GROUP BY "tradeCategory", "city", "district", "period"
          HAVING COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "period" ASC
        `
      : await this.prisma.$queryRaw<WageScaleRow[]>`
          SELECT
            "tradeCategory",
            "city",
            NULL as "district",
            "period",
            MIN(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "minAmount",
            AVG(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "averageAmount",
            MAX(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "maxAmount",
            COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(amount) FILTER (WHERE "submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE "submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM wage_submissions
          WHERE "createdAt" >= ${since}
            AND "tradeCategory" = ${tradeCategory}
            AND "city" = ${city}
          GROUP BY "tradeCategory", "city", "period"
          HAVING COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "period" ASC
        `;

    return rows.map((r) => ({
      tradeCategory: r.tradeCategory,
      city: r.city,
      district: r.district,
      period: r.period as WageScalePoint["period"],
      minAmount: r.minAmount,
      averageAmount: Math.round(r.averageAmount),
      maxAmount: r.maxAmount,
      sampleSize: r.sampleSize,
      expectationAverage: mapExpectation(r.expectationAverage, r.expectationSampleSize),
      expectationSampleSize: r.expectationSampleSize,
    }));
  }
}