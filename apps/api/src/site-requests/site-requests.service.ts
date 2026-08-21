import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateSiteRequestDto } from "./dto/create-site-request.dto";
import { UpdateSiteRequestDto } from "./dto/update-site-request.dto";
import { SearchSiteRequestsDto } from "./dto/search-site-requests.dto";
import { CreateSiteRequestResponseDto } from "./dto/create-site-request-response.dto";
import { UpdateSiteRequestResponseDto } from "./dto/update-site-request-response.dto";

const creatorInclude = {
  createdBy: { include: { candidateProfile: true, companyProfile: true } },
  _count: { select: { responses: true } },
};

interface SiteRequestWithCreator {
  id: string;
  createdById: string;
  requestType: string;
  tradeCategory: string | null;
  equipmentType: string | null;
  title: string;
  description: string;
  city: string;
  district: string | null;
  latitude: number;
  longitude: number;
  neededCount: number;
  neededBy: Date | null;
  status: string;
  createdAt: Date;
  createdBy: {
    candidateProfile: { fullName: string } | null;
    companyProfile: { companyName: string } | null;
  };
  _count: { responses: number };
}

@Injectable()
export class SiteRequestsService {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchSiteRequestsDto) {
    const where = {
      status: "OPEN" as const,
      ...(query.city ? { city: query.city } : {}),
      ...(query.district ? { district: query.district } : {}),
      ...(query.requestType ? { requestType: query.requestType } : {}),
    };
    const requests = await this.prisma.siteRequest.findMany({
      where,
      include: creatorInclude,
      orderBy: { createdAt: "desc" },
    });
    return requests.map(this.toDto);
  }

  async findOne(id: string) {
    const request = await this.prisma.siteRequest.findUnique({ where: { id }, include: creatorInclude });
    if (!request) throw new NotFoundException("Çağrı bulunamadı");
    return this.toDto(request);
  }

  async findMine(user: RequestUser) {
    const requests = await this.prisma.siteRequest.findMany({
      where: { createdById: user.id },
      include: creatorInclude,
      orderBy: { createdAt: "desc" },
    });
    return requests.map(this.toDto);
  }

  async create(user: RequestUser, dto: CreateSiteRequestDto) {
    const request = await this.prisma.siteRequest.create({
      data: {
        ...dto,
        neededBy: dto.neededBy ? new Date(dto.neededBy) : null,
        createdById: user.id,
      },
      include: creatorInclude,
    });
    return this.toDto(request);
  }

  async update(user: RequestUser, id: string, dto: UpdateSiteRequestDto) {
    const request = await this.prisma.siteRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("Çağrı bulunamadı");
    if (request.createdById !== user.id) throw new ForbiddenException("Bu çağrıyı düzenleme yetkiniz yok");

    const updated = await this.prisma.siteRequest.update({ where: { id }, data: dto, include: creatorInclude });
    return this.toDto(updated);
  }

  async respond(user: RequestUser, siteRequestId: string, dto: CreateSiteRequestResponseDto) {
    const request = await this.prisma.siteRequest.findUnique({ where: { id: siteRequestId } });
    if (!request || request.status !== "OPEN") throw new NotFoundException("Çağrı bulunamadı veya kapalı");

    const existing = await this.prisma.siteRequestResponse.findUnique({
      where: { siteRequestId_responderId: { siteRequestId, responderId: user.id } },
    });
    if (existing) throw new ConflictException("Bu çağrıya zaten yanıt verdiniz");

    const response = await this.prisma.siteRequestResponse.create({
      data: { siteRequestId, responderId: user.id, message: dto.message },
      include: { responder: { include: { candidateProfile: true, companyProfile: true } } },
    });
    return this.responseToDto(response);
  }

  async listResponses(user: RequestUser, siteRequestId: string) {
    const request = await this.prisma.siteRequest.findUnique({ where: { id: siteRequestId } });
    if (!request) throw new NotFoundException("Çağrı bulunamadı");
    if (request.createdById !== user.id) throw new ForbiddenException("Bu çağrının yanıtlarını görme yetkiniz yok");

    const responses = await this.prisma.siteRequestResponse.findMany({
      where: { siteRequestId },
      include: { responder: { include: { candidateProfile: true, companyProfile: true } } },
      orderBy: { createdAt: "desc" },
    });
    return responses.map(this.responseToDto);
  }

  async updateResponseStatus(user: RequestUser, responseId: string, dto: UpdateSiteRequestResponseDto) {
    const response = await this.prisma.siteRequestResponse.findUnique({
      where: { id: responseId },
      include: { siteRequest: true },
    });
    if (!response) throw new NotFoundException("Yanıt bulunamadı");
    if (response.siteRequest.createdById !== user.id) throw new ForbiddenException("Bu yanıtı güncelleme yetkiniz yok");

    const updated = await this.prisma.siteRequestResponse.update({
      where: { id: responseId },
      data: { status: dto.status },
      include: { responder: { include: { candidateProfile: true, companyProfile: true } } },
    });
    return this.responseToDto(updated);
  }

  private toDto = (request: SiteRequestWithCreator) => ({
    id: request.id,
    createdById: request.createdById,
    createdByName:
      request.createdBy.companyProfile?.companyName ?? request.createdBy.candidateProfile?.fullName ?? "Kullanıcı",
    requestType: request.requestType,
    tradeCategory: request.tradeCategory,
    equipmentType: request.equipmentType,
    title: request.title,
    description: request.description,
    city: request.city,
    district: request.district,
    latitude: request.latitude,
    longitude: request.longitude,
    neededCount: request.neededCount,
    neededBy: request.neededBy ? request.neededBy.toISOString() : null,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    responseCount: request._count.responses,
  });

  private responseToDto = (response: {
    id: string;
    siteRequestId: string;
    responderId: string;
    message: string | null;
    status: string;
    createdAt: Date;
    responder: {
      candidateProfile: { fullName: string } | null;
      companyProfile: { companyName: string } | null;
    };
  }) => ({
    id: response.id,
    siteRequestId: response.siteRequestId,
    responderId: response.responderId,
    responderName:
      response.responder.companyProfile?.companyName ?? response.responder.candidateProfile?.fullName ?? "Kullanıcı",
    message: response.message,
    status: response.status,
    createdAt: response.createdAt.toISOString(),
  });
}
