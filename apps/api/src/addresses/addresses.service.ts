import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  findMine(user: RequestUser) {
    return this.prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  async create(user: RequestUser, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({ where: { userId: user.id } });
    // Kullanıcının ilk adresi otomatik olarak varsayılan olur — "hiç varsayılan yok" durumunu önler.
    const isDefault = dto.isDefault || existingCount === 0;

    if (isDefault) {
      await this.prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return this.prisma.address.create({ data: { ...dto, isDefault, userId: user.id } });
  }

  async update(user: RequestUser, id: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException("Adres bulunamadı");
    if (address.userId !== user.id) throw new ForbiddenException("Bu adresi düzenleme yetkiniz yok");

    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async remove(user: RequestUser, id: string): Promise<{ success: true }> {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException("Adres bulunamadı");
    if (address.userId !== user.id) throw new ForbiddenException("Bu adresi silme yetkiniz yok");

    await this.prisma.address.delete({ where: { id } });

    if (address.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (next) await this.prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return { success: true };
  }
}
