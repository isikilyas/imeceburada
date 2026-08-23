import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { unlink } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";
import { SearchEquipmentDto } from "./dto/search-equipment.dto";

const ownerInclude = {
  owner: { include: { candidateProfile: true, companyProfile: true } },
};

interface EquipmentWithOwner {
  id: string;
  ownerId: string;
  equipmentType: string;
  capacity: string | null;
  city: string;
  district: string | null;
  listingType: string;
  dailyRate: number | null;
  hourlyRate: number | null;
  salePrice: number | null;
  photoUrl: string | null;
  description: string;
  status: string;
  createdAt: Date;
  owner: {
    candidateProfile: { fullName: string; phone: string | null } | null;
    companyProfile: { companyName: string; phone: string | null; phoneVerifiedAt: Date | null } | null;
  };
}

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchEquipmentDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      status: "AVAILABLE" as const,
      ...(query.equipmentType ? { equipmentType: query.equipmentType } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.district ? { district: query.district } : {}),
      ...(query.listingType ? { listingType: query.listingType } : {}),
      ...(query.q ? { description: { contains: query.q, mode: "insensitive" as const } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.equipmentListing.findMany({
        where,
        include: ownerInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.equipmentListing.count({ where }),
    ]);

    return { items: items.map(this.toDto), total, page, pageSize };
  }

  async findOne(id: string) {
    const listing = await this.prisma.equipmentListing.findUnique({ where: { id }, include: ownerInclude });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    return this.toDto(listing);
  }

  async findMine(user: RequestUser) {
    const listings = await this.prisma.equipmentListing.findMany({
      where: { ownerId: user.id },
      include: ownerInclude,
      orderBy: { createdAt: "desc" },
    });
    return listings.map(this.toDto);
  }

  async create(user: RequestUser, dto: CreateEquipmentDto) {
    const listing = await this.prisma.equipmentListing.create({
      data: { ...dto, ownerId: user.id },
      include: ownerInclude,
    });
    return this.toDto(listing);
  }

  async update(user: RequestUser, id: string, dto: UpdateEquipmentDto) {
    const listing = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.ownerId !== user.id) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    const updated = await this.prisma.equipmentListing.update({
      where: { id },
      data: dto,
      include: ownerInclude,
    });
    return this.toDto(updated);
  }

  async remove(user: RequestUser, id: string) {
    const listing = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.ownerId !== user.id) throw new ForbiddenException("Bu ilanı silme yetkiniz yok");

    await this.prisma.equipmentListing.update({ where: { id }, data: { status: "INACTIVE" } });
    return { success: true };
  }

  async setPhoto(user: RequestUser, id: string, filename: string) {
    const listing = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.ownerId !== user.id) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    if (listing.photoUrl) await unlink(join(process.cwd(), listing.photoUrl)).catch(() => undefined);
    const photoUrl = `/uploads/equipment/${filename}`;
    const updated = await this.prisma.equipmentListing.update({
      where: { id },
      data: { photoUrl },
      include: ownerInclude,
    });
    return this.toDto(updated);
  }

  async removePhoto(user: RequestUser, id: string) {
    const listing = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.ownerId !== user.id) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    if (listing.photoUrl) await unlink(join(process.cwd(), listing.photoUrl)).catch(() => undefined);
    const updated = await this.prisma.equipmentListing.update({
      where: { id },
      data: { photoUrl: null },
      include: ownerInclude,
    });
    return this.toDto(updated);
  }

  private toDto = (listing: EquipmentWithOwner) => ({
    id: listing.id,
    ownerId: listing.ownerId,
    ownerName: listing.owner.companyProfile?.companyName ?? listing.owner.candidateProfile?.fullName ?? "Kullanıcı",
    ownerPhone: listing.owner.companyProfile?.phone ?? listing.owner.candidateProfile?.phone ?? null,
    ownerVerified: !!listing.owner.companyProfile?.phoneVerifiedAt,
    equipmentType: listing.equipmentType,
    capacity: listing.capacity,
    city: listing.city,
    district: listing.district,
    listingType: listing.listingType,
    dailyRate: listing.dailyRate,
    hourlyRate: listing.hourlyRate,
    salePrice: listing.salePrice,
    photoUrl: listing.photoUrl,
    description: listing.description,
    status: listing.status,
    createdAt: listing.createdAt.toISOString(),
  });
}
