import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SearchSubcontractorsDto } from "./dto/search-subcontractors.dto";

@Injectable()
export class SubcontractorsService {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchSubcontractorsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      isPublic: true,
      ...(query.tradeCategory ? { tradeCategories: { has: query.tradeCategory } } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.district ? { district: query.district } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.subcontractorProfile.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.subcontractorProfile.count({ where }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        companyName: s.companyName,
        city: s.city,
        district: s.district,
        tradeCategories: s.tradeCategories,
        description: s.description,
      })),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const subcontractor = await this.prisma.subcontractorProfile.findUnique({ where: { id } });
    if (!subcontractor || !subcontractor.isPublic) throw new NotFoundException("Taşeron bulunamadı");

    return {
      id: subcontractor.id,
      companyName: subcontractor.companyName,
      city: subcontractor.city,
      district: subcontractor.district,
      tradeCategories: subcontractor.tradeCategories,
      description: subcontractor.description,
      phone: subcontractor.phone,
    };
  }
}