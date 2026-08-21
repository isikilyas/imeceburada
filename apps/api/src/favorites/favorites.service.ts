import { Injectable } from "@nestjs/common";
import { FavoriteListingType } from "@bau360/shared";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { CreateFavoriteDto } from "./dto/create-favorite.dto";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findMine(user: RequestUser) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map(this.toDto);
  }

  async add(user: RequestUser, dto: CreateFavoriteDto) {
    const favorite = await this.prisma.favorite.upsert({
      where: {
        userId_listingType_listingId: {
          userId: user.id,
          listingType: dto.listingType,
          listingId: dto.listingId,
        },
      },
      create: { userId: user.id, listingType: dto.listingType, listingId: dto.listingId },
      update: {},
    });
    return this.toDto(favorite);
  }

  async remove(user: RequestUser, listingType: FavoriteListingType, listingId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId: user.id, listingType, listingId },
    });
    return { success: true };
  }

  private toDto = (favorite: { id: string; listingType: string; listingId: string; createdAt: Date }) => ({
    id: favorite.id,
    listingType: favorite.listingType,
    listingId: favorite.listingId,
    createdAt: favorite.createdAt.toISOString(),
  });
}
