import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AddressesService } from "./addresses.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard)
@Controller("users/me/addresses")
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  findMine(@CurrentUser() user: RequestUser) {
    return this.addressesService.findMine(user);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(user, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.addressesService.remove(user, id);
  }
}
