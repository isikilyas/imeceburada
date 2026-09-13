import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AdminListUsersQueryDto } from "./dto/admin-list-users-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/users")
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  list(@Query() query: AdminListUsersQueryDto) {
    return this.usersService.adminListUsers(query);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.usersService.adminGetUserDetail(id);
  }
}
