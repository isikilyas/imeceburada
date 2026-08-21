import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { unlink } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateMaterialListingDto } from "./dto/create-material-listing.dto";
import { UpdateMaterialListingDto } from "./dto/update-material-listing.dto";
import { SearchMaterialListingsDto } from "./dto/search-material-listings.dto";
import { getMaterialUnit } from "@bau360/shared";

const supplierInclude = { supplier: true };

interface ListingWithSupplier {
  id: string;
  supplierId: string;
  materialType: string;
  unit: string;
  city: string;
  district: string | null;
  price: number;
  photoUrl: string | null;
  description: string;
  status: string;
  createdAt: Date;
  supplier: { companyName: string; phone: string | null };
}

@Injectable()
export class MaterialListingsService {
  constructor(private prisma: PrismaService) {}

  private async getSupplierId(user: RequestUser): Promise<string> {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } });
    if (!supplier) throw new NotFoundException("Tedarikçi profili bulunamadı");
    return supplier.id;
  }

  async search(query: SearchMaterialListingsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      status: "AVAILABLE" as const,
      ...(query.materialType ? { materialType: query.materialType } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.district ? { district: query.district } : {}),
      ...(query.q ? { description: { contains: query.q, mode: "insensitive" as const } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.materialListing.findMany({
        where,
        include: supplierInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.materialListing.count({ where }),
    ]);

    return { items: items.map(this.toDto), total, page, pageSize };
  }

  async findOne(id: string) {
    const listing = await this.prisma.materialListing.findUnique({ where: { id }, include: supplierInclude });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    return this.toDto(listing);
  }

  async findMine(user: RequestUser) {
    const supplierId = await this.getSupplierId(user);
    const listings = await this.prisma.materialListing.findMany({
      where: { supplierId },
      include: supplierInclude,
      orderBy: { createdAt: "desc" },
    });
    return listings.map(this.toDto);
  }

  async create(user: RequestUser, dto: CreateMaterialListingDto) {
    const supplierId = await this.getSupplierId(user);
    const listing = await this.prisma.materialListing.create({
      data: { ...dto, unit: getMaterialUnit(dto.materialType), supplierId },
      include: supplierInclude,
    });
    return this.toDto(listing);
  }

  async update(user: RequestUser, id: string, dto: UpdateMaterialListingDto) {
    const supplierId = await this.getSupplierId(user);
    const listing = await this.prisma.materialListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.supplierId !== supplierId) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    const updated = await this.prisma.materialListing.update({
      where: { id },
      data: dto,
      include: supplierInclude,
    });
    return this.toDto(updated);
  }

  async remove(user: RequestUser, id: string) {
    const supplierId = await this.getSupplierId(user);
    const listing = await this.prisma.materialListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.supplierId !== supplierId) throw new ForbiddenException("Bu ilanı silme yetkiniz yok");

    await this.prisma.materialListing.update({ where: { id }, data: { status: "INACTIVE" } });
    return { success: true };
  }

  async setPhoto(user: RequestUser, id: string, filename: string) {
    const supplierId = await this.getSupplierId(user);
    const listing = await this.prisma.materialListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.supplierId !== supplierId) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    if (listing.photoUrl) await unlink(join(process.cwd(), listing.photoUrl)).catch(() => undefined);
    const photoUrl = `/uploads/materials/${filename}`;
    const updated = await this.prisma.materialListing.update({
      where: { id },
      data: { photoUrl },
      include: supplierInclude,
    });
    return this.toDto(updated);
  }

  async removePhoto(user: RequestUser, id: string) {
    const supplierId = await this.getSupplierId(user);
    const listing = await this.prisma.materialListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("İlan bulunamadı");
    if (listing.supplierId !== supplierId) throw new ForbiddenException("Bu ilanı düzenleme yetkiniz yok");

    if (listing.photoUrl) await unlink(join(process.cwd(), listing.photoUrl)).catch(() => undefined);
    const updated = await this.prisma.materialListing.update({
      where: { id },
      data: { photoUrl: null },
      include: supplierInclude,
    });
    return this.toDto(updated);
  }

  private toDto = (listing: ListingWithSupplier) => ({
    id: listing.id,
    supplierId: listing.supplierId,
    supplierName: listing.supplier.companyName,
    supplierPhone: listing.supplier.phone,
    materialType: listing.materialType,
    unit: listing.unit,
    city: listing.city,
    district: listing.district,
    price: listing.price,
    photoUrl: listing.photoUrl,
    description: listing.description,
    status: listing.status,
    createdAt: listing.createdAt.toISOString(),
  });
}