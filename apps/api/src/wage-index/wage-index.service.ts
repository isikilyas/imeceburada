import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TaxonomyService } from "../taxonomy/taxonomy.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateWageSubmissionDto } from "./dto/create-wage-submission.dto";
import { WageIndexQueryDto } from "./dto/wage-index-query.dto";
import {
  WAGE_INDEX_MIN_SAMPLE_SIZE,
  WageHomepageSummaryResponse,
  WageIndexPoint,
  WageScalePoint,
} from "@imeceburada/shared";

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

interface WageHomepageSummaryRow {
  tradeCategory: string;
  employerAverage: number | null;
  employerSampleSize: number;
  jobseekerAverage: number | null;
  jobseekerSampleSize: number;
  sampleSize: number;
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

  /**
   * Profilinde kayıtlı telefon varsa onu kullanır; yoksa (ör. profil telefonu
   * hiç girmemiş bir kullanıcı) formda o an girilen `dto.phone`'a düşer —
   * eskiden bu durumda işlem tamamen reddediliyordu.
   */
  private async getSubmitterPhone(user: RequestUser, dtoPhone?: string): Promise<string> {
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
    const phone = profile?.phone || dtoPhone;
    if (!phone) {
      throw new BadRequestException("Bir telefon numarası girmelisin");
    }
    return phone;
  }

  async submit(user: RequestUser, dto: CreateWageSubmissionDto) {
    if (dto.subjectType === "EQUIPMENT" && !dto.equipmentType) {
      throw new BadRequestException("Ekipman türü zorunludur");
    }
    if (dto.subjectType !== "EQUIPMENT" && !dto.tradeCategory) {
      throw new BadRequestException("Meslek/branş zorunludur");
    }
    if (dto.subjectType === "TEAM" && !dto.teamSize) {
      throw new BadRequestException("Ekip büyüklüğü zorunludur");
    }
    if (dto.subjectType === "INDIVIDUAL" && !dto.experienceLevel) {
      throw new BadRequestException("Deneyim seviyesi zorunludur");
    }

    const phone = await this.getSubmitterPhone(user, dto.phone);
    const submissionMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    // subjectType'a göre uygulanmayan alanları (ör. TEAM'de experienceLevel, EQUIPMENT'ta
    // tradeCategory) hiç yazmıyoruz — DTO'dan boşuna/kötü niyetle gelmiş olsalar bile
    // veritabanına girmesinler ve dedup anahtarının bileşimini bozmasınlar.
    const tradeCategory =
      dto.subjectType !== "EQUIPMENT" && dto.tradeCategory
        ? await this.taxonomyService.resolveOrQueueTerm("TRADE_PROFESSION", dto.tradeCategory, user.id)
        : undefined;
    const equipmentType =
      dto.subjectType === "EQUIPMENT" && dto.equipmentType
        ? await this.taxonomyService.resolveOrQueueTerm("EQUIPMENT_TYPE", dto.equipmentType, user.id)
        : undefined;
    const experienceLevel = dto.subjectType === "INDIVIDUAL" ? dto.experienceLevel : undefined;
    const teamSize = dto.subjectType === "TEAM" ? dto.teamSize : undefined;
    try {
      const submission = await this.prisma.wageSubmission.create({
        data: {
          subjectType: dto.subjectType,
          city: dto.city,
          district: dto.district,
          amount: dto.amount,
          period: dto.period,
          submissionType: dto.submissionType,
          tradeCategory,
          equipmentType,
          experienceLevel,
          teamSize,
          submittedById: user.id,
          phone,
          submissionMonth,
        },
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
            AND ws."subjectType" = 'INDIVIDUAL'
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
            AND ws."subjectType" = 'INDIVIDUAL'
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
   * Ana sayfadaki "Türkiye Ortalaması" / "Bulunduğun Yer" özet slaytı — son 3 aydaki
   * en çok veri girilen meslekleri (örneklem büyüklüğüne göre), şehir verilmezse
   * Türkiye geneli, verilirse o ile kısıtlı olarak özetler. getIndex ile aynı gizlilik
   * eşiğini uygular; period'a göre ayrım yapmaz (getIndex'teki mevcut basitleştirme).
   */
  async getHomepageSummary(city?: string): Promise<WageHomepageSummaryResponse> {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    const cityParam = city ?? null;

    const rows = await this.prisma.$queryRaw<WageHomepageSummaryRow[]>`
      SELECT
        ws."tradeCategory",
        AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::float as "employerAverage",
        COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role IN ('COMPANY', 'SUBCONTRACTOR'))::int as "employerSampleSize",
        AVG(ws.amount) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::float as "jobseekerAverage",
        COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL' AND u.role = 'CANDIDATE')::int as "jobseekerSampleSize",
        COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL')::int as "sampleSize"
      FROM wage_submissions ws
      JOIN users u ON u.id = ws."submittedById"
      WHERE ws."createdAt" >= ${since}
        AND ws."subjectType" = 'INDIVIDUAL'
        AND (${cityParam}::text IS NULL OR ws."city" = ${cityParam})
      GROUP BY ws."tradeCategory"
      HAVING COUNT(*) FILTER (WHERE ws."submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
      ORDER BY "sampleSize" DESC
      LIMIT 6
    `;

    return {
      scope: city ? "CITY" : "NATIONAL",
      city: city ?? null,
      items: rows.map((r) => ({
        tradeCategory: r.tradeCategory,
        averageAmount: Math.round(combineEmployerAndJobseeker(r.employerAverage, r.jobseekerAverage)),
        sampleSize: r.sampleSize,
      })),
    };
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
            AND ws."subjectType" = 'INDIVIDUAL'
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
            AND ws."subjectType" = 'INDIVIDUAL'
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
