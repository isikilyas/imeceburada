import { Body, Controller, Get, Headers, Post, Query, UseGuards } from "@nestjs/common";
import { MembershipService } from "./membership.service";
import { InitiateCheckoutDto } from "./dto/initiate-checkout.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@Controller("membership")
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get("plans")
  getPlans() {
    return this.membershipService.getPlans();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("COMPANY", "SUPPLIER", "SUBCONTRACTOR")
  @Get("me")
  getMyMembership(@CurrentUser() user: RequestUser) {
    return this.membershipService.getMyMembership(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("COMPANY", "SUPPLIER", "SUBCONTRACTOR")
  @Post("checkout")
  initiateCheckout(@CurrentUser() user: RequestUser, @Body() dto: InitiateCheckoutDto) {
    return this.membershipService.initiateCheckout(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("COMPANY", "SUPPLIER", "SUBCONTRACTOR")
  @Post("callback")
  confirmCheckout(@CurrentUser() user: RequestUser, @Query("token") token: string) {
    return this.membershipService.confirmCheckout(user, token);
  }

  /** iyzico'nun sunucudan sunucuya çağırdığı webhook — auth guard'sız. */
  @Post("webhook")
  handleWebhook(@Body() body: Record<string, unknown>, @Headers("x-iyz-signature-v3") signature: string) {
    return this.membershipService.handleWebhook(
      {
        iyziEventType: String(body.iyziEventType ?? ""),
        subscriptionReferenceCode: String(body.subscriptionReferenceCode ?? ""),
        orderReferenceCode: String(body.orderReferenceCode ?? ""),
        customerReferenceCode: String(body.customerReferenceCode ?? ""),
      },
      signature,
    );
  }
}