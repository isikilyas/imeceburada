import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MembershipStatus as PrismaMembershipStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { IyzicoService } from "../iyzico/iyzico.service";
import { RequestUser } from "../auth/types/request-user";
import { InitiateCheckoutDto } from "./dto/initiate-checkout.dto";
import { CompanyMembershipDto, InitiateCheckoutResponse, MEMBERSHIP_PLANS } from "@imeceburada/shared";
import { isBetaFreeAccess } from "./beta.util";

interface PayingProfile {
  id: string;
  phone: string | null;
  phoneVerifiedAt: Date | null;
  membershipStatus: PrismaMembershipStatus;
  membershipExpiresAt: Date | null;
  isPremium: boolean;
  userId: string;
}

type PayingRole = "COMPANY" | "SUPPLIER" | "SUBCONTRACTOR";

@Injectable()
export class MembershipService {
  constructor(
    private prisma: PrismaService,
    private iyzico: IyzicoService,
    private config: ConfigService,
  ) {}

  getPlans() {
    return MEMBERSHIP_PLANS;
  }

  private async findProfile(user: RequestUser): Promise<PayingProfile> {
    if (user.role === "COMPANY") {
      const profile = await this.prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Şirket profili bulunamadı");
      return profile;
    }
    if (user.role === "SUPPLIER") {
      const profile = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Tedarikçi profili bulunamadı");
      return profile;
    }
    if (user.role === "SUBCONTRACTOR") {
      const profile = await this.prisma.subcontractorProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Taşeron profili bulunamadı");
      return profile;
    }
    throw new ForbiddenException("Bu işlem sadece şirket, tedarikçi veya taşeron hesapları içindir");
  }

  private updateProfileMembershipByRole(
    role: PayingRole,
    id: string,
    data: {
      membershipStatus: PrismaMembershipStatus;
      membershipExpiresAt?: Date | null;
      isPremium?: boolean;
      currentPlan?: "MONTHLY" | "YEARLY" | null;
    },
  ) {
    if (role === "COMPANY") return this.prisma.companyProfile.update({ where: { id }, data });
    if (role === "SUPPLIER") return this.prisma.supplierProfile.update({ where: { id }, data });
    return this.prisma.subcontractorProfile.update({ where: { id }, data });
  }

  private subscriptionOwnerWhere(role: PayingRole, profileId: string) {
    if (role === "COMPANY") return { companyId: profileId };
    if (role === "SUPPLIER") return { supplierId: profileId };
    return { subcontractorId: profileId };
  }

  private subscriptionOwnerCreateData(role: PayingRole, profileId: string) {
    if (role === "COMPANY") return { companyId: profileId };
    if (role === "SUPPLIER") return { supplierId: profileId };
    return { subcontractorId: profileId };
  }

  async getMyMembership(user: RequestUser): Promise<CompanyMembershipDto> {
    const profile = await this.findProfile(user);

    const latestSubscription = await this.prisma.membershipSubscription.findFirst({
      where: this.subscriptionOwnerWhere(user.role as PayingRole, profile.id),
      orderBy: { createdAt: "desc" },
    });

    const betaFreeAccess = isBetaFreeAccess(this.config);

    return {
      status: profile.membershipStatus as CompanyMembershipDto["status"],
      plan: latestSubscription?.plan ?? null,
      expiresAt: profile.membershipExpiresAt?.toISOString() ?? null,
      phoneVerified: !!profile.phoneVerifiedAt,
      isPremium: betaFreeAccess || profile.isPremium,
      betaFreeAccess,
    };
  }

  async initiateCheckout(user: RequestUser, dto: InitiateCheckoutDto): Promise<InitiateCheckoutResponse> {
    const profile = await this.findProfile(user);
    const email = (await this.prisma.user.findUnique({ where: { id: profile.userId } }))?.email;
    if (!email) throw new NotFoundException("Kullanıcı bulunamadı");

    if (!profile.phoneVerifiedAt) {
      throw new BadRequestException("Ödemeye geçmeden önce telefon numaranı doğrulamalısın");
    }
    if (!profile.phone) {
      throw new BadRequestException("Telefon numarası bulunamadı");
    }

    const pricingPlanReferenceCode =
      dto.plan === "MONTHLY"
        ? this.config.get<string>("IYZICO_PRICING_PLAN_MONTHLY")
        : this.config.get<string>("IYZICO_PRICING_PLAN_YEARLY");
    if (!pricingPlanReferenceCode) {
      throw new BadRequestException(
        "Ödeme planı henüz yapılandırılmadı (IYZICO_PRICING_PLAN_MONTHLY/YEARLY ortam değişkenleri eksik)",
      );
    }

    const subscription = await this.prisma.membershipSubscription.create({
      data: {
        ...this.subscriptionOwnerCreateData(user.role as PayingRole, profile.id),
        plan: dto.plan,
        status: "PENDING",
        iyzicoPricingPlanReferenceCode: pricingPlanReferenceCode,
      },
    });

    const [name, ...rest] = dto.billingContactName.trim().split(/\s+/);
    const surname = rest.join(" ") || name;
    const webBaseUrl = this.config.get<string>("WEB_BASE_URL") ?? "http://localhost:3000";

    const result = await this.iyzico.initializeCheckout({
      pricingPlanReferenceCode,
      conversationId: subscription.id,
      callbackUrl: `${webBaseUrl}/membership/callback`,
      customer: {
        name,
        surname,
        email,
        gsmNumber: profile.phone,
        identityNumber: dto.identityNumber,
      },
      billingAddress: {
        contactName: dto.billingContactName,
        city: dto.billingCity,
        country: "Türkiye",
        address: dto.billingAddress,
        zipCode: dto.billingZipCode,
      },
    });

    await this.prisma.membershipSubscription.update({
      where: { id: subscription.id },
      data: { checkoutToken: result.token },
    });

    return { checkoutFormContent: result.checkoutFormContent, token: result.token };
  }

  /** Ödeme sonrası kullanıcı callbackUrl'e döndüğünde web tarafının çağırdığı uç. */
  async confirmCheckout(user: RequestUser, token: string) {
    const profile = await this.findProfile(user);
    const subscription = await this.prisma.membershipSubscription.findFirst({
      where: {
        checkoutToken: token,
        ...this.subscriptionOwnerWhere(user.role as PayingRole, profile.id),
      },
    });
    if (!subscription) throw new NotFoundException("Abonelik kaydı bulunamadı");

    const result = await this.iyzico.retrieveCheckoutFormResult(token);
    const isActive = result.status === "success" || result.status === "ACTIVE";

    await this.prisma.membershipSubscription.update({
      where: { id: subscription.id },
      data: {
        status: isActive ? "ACTIVE" : "PENDING",
        iyzicoSubscriptionReferenceCode: result.subscriptionReferenceCode,
        startedAt: isActive ? new Date() : undefined,
      },
    });

    if (isActive) {
      const periodEnd = this.calculatePeriodEnd(subscription.plan);
      const ownerId = subscription.companyId ?? subscription.supplierId ?? subscription.subcontractorId;
      if (ownerId) {
        await this.updateProfileMembershipByRole(user.role as PayingRole, ownerId, {
          membershipStatus: "ACTIVE",
          membershipExpiresAt: periodEnd,
          isPremium: true,
          currentPlan: subscription.plan,
        });
      }
    }

    return { status: isActive ? "ACTIVE" : "PENDING" };
  }

  async handleWebhook(
    payload: {
      iyziEventType: string;
      subscriptionReferenceCode: string;
      orderReferenceCode: string;
      customerReferenceCode: string;
    },
    signatureHeader: string,
  ) {
    const isValid = this.iyzico.verifyWebhookSignature({
      eventType: payload.iyziEventType,
      subscriptionReferenceCode: payload.subscriptionReferenceCode,
      orderReferenceCode: payload.orderReferenceCode,
      customerReferenceCode: payload.customerReferenceCode,
      signatureHeader,
    });
    if (!isValid) throw new BadRequestException("Geçersiz webhook imzası");

    const subscription = await this.prisma.membershipSubscription.findFirst({
      where: { iyzicoSubscriptionReferenceCode: payload.subscriptionReferenceCode },
    });
    if (!subscription) return { success: true };

    const role: PayingRole | null = subscription.companyId
      ? "COMPANY"
      : subscription.supplierId
        ? "SUPPLIER"
        : subscription.subcontractorId
          ? "SUBCONTRACTOR"
          : null;
    const ownerId = subscription.companyId ?? subscription.supplierId ?? subscription.subcontractorId;
    if (!role || !ownerId) return { success: true };

    if (payload.iyziEventType === "subscription.order.success") {
      const periodEnd = this.calculatePeriodEnd(subscription.plan);
      await this.prisma.membershipSubscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", currentPeriodEnd: periodEnd },
      });
      await this.updateProfileMembershipByRole(role, ownerId, {
        membershipStatus: "ACTIVE",
        membershipExpiresAt: periodEnd,
        isPremium: true,
        currentPlan: subscription.plan,
      });
    } else if (payload.iyziEventType === "subscription.order.failure") {
      await this.updateProfileMembershipByRole(role, ownerId, {
        membershipStatus: "EXPIRED",
        isPremium: false,
      });
    }

    return { success: true };
  }

  private calculatePeriodEnd(plan: "MONTHLY" | "YEARLY"): Date {
    const date = new Date();
    if (plan === "MONTHLY") date.setMonth(date.getMonth() + 1);
    else date.setFullYear(date.getFullYear() + 1);
    return date;
  }
}