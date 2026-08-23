import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { SearchJobsDto } from "./dto/search-jobs.dto";

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async search(query: SearchJobsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where = {
      status: "ACTIVE" as const,
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

    return { items: items.map(this.toDto), total, page, pageSize };
  }

  async findOne(id: string) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id }, include: { company: true } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    return this.toDto(job);
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
    const job = await this.prisma.jobPosting.create({
      data: { ...dto, companyId },
      include: { company: true },
    });
    return this.toDto(job);
  }

  async update(user: RequestUser, id: string, dto: UpdateJobDto) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    if (job.companyId !== companyId) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: dto,
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
