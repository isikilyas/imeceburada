import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ApplicationStatus, CANDIDATE_LISTING_TYPES, ListingIntent } from "@imeceburada/shared";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { RequestUser } from "../auth/types/request-user";
import { EMAIL_SERVICE, EmailService } from "../email/email.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Beklemede",
  REVIEWED: "İncelendi",
  ACCEPTED: "Kabul Edildi",
  REJECTED: "Reddedildi",
};

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    @Inject(EMAIL_SERVICE) private emailService: EmailService,
  ) {}

  async create(user: RequestUser, dto: CreateApplicationDto) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobId },
      include: { company: { include: { user: true } } },
    });
    if (!job || job.status !== "ACTIVE") throw new NotFoundException("İlan bulunamadı veya kapalı");

    const isCandidateListing = CANDIDATE_LISTING_TYPES.includes(job.listingType as ListingIntent);
    if (user.role === "CANDIDATE" && !isCandidateListing) {
      throw new BadRequestException("Bu ilana sadece taşeron firmalar başvurabilir");
    }
    if (user.role === "SUBCONTRACTOR" && isCandidateListing) {
      throw new BadRequestException("Bu ilana sadece iş arayan personel başvurabilir");
    }

    const candidateId = user.role === "CANDIDATE" ? await this.usersService.getCandidateProfileIdForUser(user.id) : undefined;
    const subcontractorId =
      user.role === "SUBCONTRACTOR" ? await this.usersService.getSubcontractorProfileIdForUser(user.id) : undefined;

    const existing = await this.prisma.application.findFirst({
      where: { jobId: dto.jobId, ...(candidateId ? { candidateId } : { subcontractorId }) },
    });
    if (existing) throw new ConflictException("Bu ilana zaten başvurdunuz");

    let application;
    try {
      application = await this.prisma.application.create({
        data: {
          jobId: dto.jobId,
          candidateId,
          subcontractorId,
          message: dto.message,
          expectedWage: dto.expectedWage,
        },
        include: { job: true, candidate: true, subcontractor: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Bu ilana zaten başvurdunuz");
      }
      throw err;
    }

    if (job.company.notifyByEmail) {
      await this.emailService
        .sendNewApplicationNotification(job.company.user.email, job.title, this.applicantName(application))
        .catch(() => undefined);
    }

    return this.toDto(application);
  }

  /** Tek bir başvuru — sadece o başvurunun tarafı (aday/taşeron) ya da ilanı açan firma görebilir (mesajlaşma/yorum sayfaları için). */
  async findOne(user: RequestUser, id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: true, subcontractor: true },
    });
    if (!application) throw new NotFoundException("Başvuru bulunamadı");

    const isApplicant =
      application.candidate?.userId === user.id || application.subcontractor?.userId === user.id;
    const isCompany =
      user.role === "COMPANY" && application.job.companyId === (await this.usersService.getCompanyProfileIdForUser(user.id));
    if (!isApplicant && !isCompany) throw new ForbiddenException("Bu başvuruya erişemezsiniz");

    return this.toDto(application);
  }

  async findMine(user: RequestUser) {
    const where =
      user.role === "CANDIDATE"
        ? { candidateId: await this.usersService.getCandidateProfileIdForUser(user.id) }
        : { subcontractorId: await this.usersService.getSubcontractorProfileIdForUser(user.id) };
    const applications = await this.prisma.application.findMany({
      where,
      include: { job: true, candidate: true, subcontractor: true },
      orderBy: { createdAt: "desc" },
    });
    return applications.map((a) => this.toDto(a));
  }

  async findForJob(user: RequestUser, jobId: string) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const job = await this.prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException("İlan bulunamadı");
    if (job.companyId !== companyId) throw new ForbiddenException("Bu ilanın başvurularını görme yetkiniz yok");

    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: { job: true, candidate: true, subcontractor: true },
      orderBy: { createdAt: "desc" },
    });
    return applications.map((a) => this.toDto(a));
  }

  async updateStatus(user: RequestUser, id: string, dto: UpdateApplicationStatusDto) {
    const companyId = await this.usersService.getCompanyProfileIdForUser(user.id);
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: { include: { user: true } }, subcontractor: { include: { user: true } } },
    });
    if (!application) throw new NotFoundException("Başvuru bulunamadı");
    if (application.job.companyId !== companyId) throw new ForbiddenException("Bu başvuruyu güncelleme yetkiniz yok");

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status, ...(dto.offeredWage !== undefined ? { offeredWage: dto.offeredWage } : {}) },
      include: { job: true, candidate: true, subcontractor: true },
    });

    const applicantUser = application.candidate?.user ?? application.subcontractor?.user;
    const applicantNotifyByEmail = application.candidate?.notifyByEmail ?? true;
    if (applicantUser && applicantNotifyByEmail) {
      await this.emailService
        .sendApplicationStatusNotification(applicantUser.email, application.job.title, STATUS_LABELS[dto.status])
        .catch(() => undefined);
    }

    return this.toDto(updated);
  }

  private applicantName(application: { candidate: { fullName: string } | null; subcontractor: { companyName: string } | null }) {
    return application.candidate?.fullName ?? application.subcontractor?.companyName ?? "";
  }

  private toDto = (application: {
    id: string;
    jobId: string;
    candidateId: string | null;
    subcontractorId: string | null;
    status: string;
    expectedWage: number | null;
    offeredWage: number | null;
    createdAt: Date;
    job: { title: string };
    candidate: { fullName: string } | null;
    subcontractor: { companyName: string } | null;
  }) => ({
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.job.title,
    applicantType: application.candidateId ? ("CANDIDATE" as const) : ("SUBCONTRACTOR" as const),
    applicantId: application.candidateId ?? application.subcontractorId ?? "",
    applicantName: this.applicantName(application),
    status: application.status,
    expectedWage: application.expectedWage,
    offeredWage: application.offeredWage,
    createdAt: application.createdAt.toISOString(),
  });
}
