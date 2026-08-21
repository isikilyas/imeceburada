import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(user: RequestUser, dto: CreateApplicationDto) {
    const candidateId = await this.usersService.getCandidateProfileIdForUser(user.id);

    const job = await this.prisma.jobPosting.findUnique({ where: { id: dto.jobId } });
    if (!job || job.status !== "ACTIVE") throw new NotFoundException("İlan bulunamadı veya kapalı");

    const existing = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: dto.jobId, candidateId } },
    });
    if (existing) throw new ConflictException("Bu ilana zaten başvurdunuz");

    const application = await this.prisma.application.create({
      data: { jobId: dto.jobId, candidateId, message: dto.message },
      include: { job: true, candidate: true },
    });
    return this.toDto(application);
  }

  async findMine(user: RequestUser) {
    const candidateId = await this.usersService.getCandidateProfileIdForUser(user.id);
    const applications = await this.prisma.application.findMany({
      where: { candidateId },
      include: { job: true, candidate: true },
      orderBy: { createdAt: "desc" },
    });
    return applications.map(this.toDto);
  }

  async findForJob(user: RequestUser, jobId: string) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const job = await this.prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    if (job.companyId !== companyId) throw new ForbiddenException("Bu ilanın başvurularını görme yetkiniz yok");

    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: { job: true, candidate: true },
      orderBy: { createdAt: "desc" },
    });
    return applications.map(this.toDto);
  }

  async updateStatus(user: RequestUser, id: string, dto: UpdateApplicationStatusDto) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!application) throw new NotFoundException("Başvuru bulunamadı");
    if (application.job.companyId !== companyId) throw new ForbiddenException("Bu başvuruyu güncelleme yetkiniz yok");

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
      include: { job: true, candidate: true },
    });
    return this.toDto(updated);
  }

  private toDto = (application: {
    id: string;
    jobId: string;
    candidateId: string;
    status: string;
    createdAt: Date;
    job: { title: string };
    candidate: { fullName: string };
  }) => ({
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.job.title,
    candidateId: application.candidateId,
    candidateName: application.candidate.fullName,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
  });
}
