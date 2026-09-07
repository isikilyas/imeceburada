import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateMaterialSubmissionDto } from "./dto/create-material-submission.dto";
import { MaterialIndexQueryDto } from "./dto/material-index-query.dto";
import { getMaterialUnit, MaterialIndexPoint, WAGE_INDEX_MIN_SAMPLE_SIZE } from "@imeceburada/shared";

interface MaterialIndexRow {
  month: string;
  materialType: string;
  city: string;
  district: string | null;
  averageAmount: number;
  medianAmount: number;
  sampleSize: number;
  expectationAverage: number | null;
  expectationSampleSize: number;
}

function mapExpectation(average: number | null, sampleSize: number) {
  return sampleSize >= WAGE_INDEX_MIN_SAMPLE_SIZE && average !== null ? Math.round(average) : null;
}

@Injectable()
export class MaterialIndexService {
  constructor(private prisma: PrismaService) {}

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

  async submit(user: RequestUser, dto: CreateMaterialSubmissionDto) {
    const phone = await this.getSubmitterPhone(user);
    const submissionMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    try {
      const submission = await this.prisma.materialPriceSubmission.create({
        data: { ...dto, unit: getMaterialUnit(dto.materialType), submittedById: user.id, phone, submissionMonth },
      });
      return { success: true, id: submission.id };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Bu malzeme ve şehir için bu ay zaten veri girdin");
      }
      throw err;
    }
  }

  /**
   * İlçe seçilmişse o ilçenin ortalaması (district bazlı grupla); sadece il
   * seçilmişse o ile ait TÜM ilçelerin birleşik (il bazlı) ortalaması döner.
   * Endeksin ana rakamı sadece "Gerçekleşen/Ödenen" gönderimlerden hesaplanır;
   * "Teklif/Beklenti" gönderimleri ayrı bir alan olarak (expectationAverage) döner.
   */
  async getIndex(query: MaterialIndexQueryDto): Promise<MaterialIndexPoint[]> {
    const months = query.months ?? 6;
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const materialType = query.materialType ?? null;
    const city = query.city ?? null;
    const district = query.district ?? null;

    const rows = district
      ? await this.prisma.$queryRaw<MaterialIndexRow[]>`
          SELECT
            to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as "month",
            "materialType",
            "city",
            "district",
            AVG(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "averageAmount",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "medianAmount",
            COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(amount) FILTER (WHERE "submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE "submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM material_price_submissions
          WHERE "createdAt" >= ${since}
            AND (${materialType}::text IS NULL OR "materialType" = ${materialType})
            AND (${city}::text IS NULL OR "city" = ${city})
            AND "district" = ${district}
          GROUP BY "month", "materialType", "city", "district"
          HAVING COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "month" ASC
        `
      : await this.prisma.$queryRaw<MaterialIndexRow[]>`
          SELECT
            to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as "month",
            "materialType",
            "city",
            NULL as "district",
            AVG(amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "averageAmount",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) FILTER (WHERE "submissionType" = 'ACTUAL')::float as "medianAmount",
            COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL')::int as "sampleSize",
            AVG(amount) FILTER (WHERE "submissionType" = 'OFFER')::float as "expectationAverage",
            COUNT(*) FILTER (WHERE "submissionType" = 'OFFER')::int as "expectationSampleSize"
          FROM material_price_submissions
          WHERE "createdAt" >= ${since}
            AND (${materialType}::text IS NULL OR "materialType" = ${materialType})
            AND (${city}::text IS NULL OR "city" = ${city})
          GROUP BY "month", "materialType", "city"
          HAVING COUNT(*) FILTER (WHERE "submissionType" = 'ACTUAL') >= ${WAGE_INDEX_MIN_SAMPLE_SIZE}
          ORDER BY "month" ASC
        `;

    return rows.map((r: MaterialIndexRow) => ({
      month: r.month,
      materialType: r.materialType,
      city: r.city,
      district: r.district,
      unit: getMaterialUnit(r.materialType),
      averageAmount: Math.round(r.averageAmount),
      medianAmount: Math.round(r.medianAmount),
      sampleSize: r.sampleSize,
      expectationAverage: mapExpectation(r.expectationAverage, r.expectationSampleSize),
      expectationSampleSize: r.expectationSampleSize,
    }));
  }
}