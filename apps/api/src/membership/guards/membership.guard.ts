import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RequestUser } from "../../auth/types/request-user";

/**
 * Şirket, tedarikçi veya taşeron hesabının aktif (süresi dolmamış) üyeliği
 * olmasını zorunlu kılar. JwtAuthGuard + RolesGuard'dan SONRA uygulanmalı.
 */
@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: RequestUser | undefined = request.user;
    if (!user) throw new ForbiddenException("Giriş yapmalısınız");

    const profile =
      user.role === "COMPANY"
        ? await this.prisma.companyProfile.findUnique({ where: { userId: user.id } })
        : user.role === "SUPPLIER"
          ? await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } })
          : user.role === "SUBCONTRACTOR"
            ? await this.prisma.subcontractorProfile.findUnique({ where: { userId: user.id } })
            : null;

    if (!profile) throw new ForbiddenException("Şirket/tedarikçi/taşeron profili bulunamadı");

    const isActive =
      profile.membershipStatus === "ACTIVE" &&
      (!profile.membershipExpiresAt || profile.membershipExpiresAt > new Date());

    if (!isActive) {
      throw new ForbiddenException(
        "Bu işlem için aktif bir üyeliğin olmalı. Üyelik sayfasından abone olabilirsin.",
      );
    }
    return true;
  }
}