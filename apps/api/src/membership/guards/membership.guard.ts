import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { RequestUser } from "../../auth/types/request-user";
import { isBetaFreeAccess } from "../beta.util";

/**
 * Şirket, tedarikçi veya taşeron hesabının aktif (süresi dolmamış) üyeliği
 * olmasını zorunlu kılar. JwtAuthGuard + RolesGuard'dan SONRA uygulanmalı.
 *
 * Erken Erişim/Beta döneminde (BETA_FREE_ACCESS=true) bu kontrol tamamen
 * atlanır — kurumsal hesaplar da dahil herkese tam erişim verilir. Bu bayrak
 * kapatıldığında (üyelik ücretlendirmesi başladığında) kod değişikliği
 * gerekmeden eski davranışa döner.
 */
@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isBetaFreeAccess(this.config)) return true;

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