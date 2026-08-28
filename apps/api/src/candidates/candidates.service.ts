import { Injectable, NotFoundException } from "@nestjs/common";
import { CandidateProfile } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SearchCandidatesDto } from "./dto/search-candidates.dto";

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchCandidatesDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      isPublic: true,
      ...(query.tradeCategory ? { primaryTradeCategory: query.tradeCategory } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.district ? { district: query.district } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.candidateProfile.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.candidateProfile.count({ where }),
    ]);

    return {
      items: items.map((c: CandidateProfile) => ({
        id: c.id,
        fullName: c.fullName,
        city: c.city,
        district: c.district,
        experienceYears: c.experienceYears,
        primaryTradeCategory: c.primaryTradeCategory,
        skills: c.skills,
        workPreferences: c.workPreferences,
        availabilityStatus: c.availabilityStatus,
        photoUrl: c.photoVisible ? c.photoUrl : null,
      })),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({ where: { id } });
    if (!candidate || !candidate.isPublic) throw new NotFoundException("Aday bulunamadı");

    return {
      id: candidate.id,
      fullName: candidate.fullName,
      city: candidate.city,
      district: candidate.district,
      experienceYears: candidate.experienceYears,
      primaryTradeCategory: candidate.primaryTradeCategory,
      skills: candidate.skills,
      workPreferences: candidate.workPreferences,
      availabilityStatus: candidate.availabilityStatus,
      phone: candidate.phone,
      photoUrl: candidate.photoVisible ? candidate.photoUrl : null,
    };
  }
}