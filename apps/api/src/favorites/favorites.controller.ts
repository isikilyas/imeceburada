import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { FavoriteListingType } from "@imeceburada/shared";
import { FavoritesService } from "./favorites.service";
import { CreateFavoriteDto } from "./dto/create-favorite.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findMine(@CurrentUser() user: RequestUser) {
    return this.favoritesService.findMine(user);
  }

  @Post()
  add(@CurrentUser() user: RequestUser, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(user, dto);
  }

  @Delete(":listingType/:listingId")
  remove(
    @CurrentUser() user: RequestUser,
    @Param("listingType") listingType: FavoriteListingType,
    @Param("listingId") listingId: string,
  ) {
    return this.favoritesService.remove(user, listingType, listingId);
  }
}
