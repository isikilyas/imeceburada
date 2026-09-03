import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomInt } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { SMS_SERVICE, SmsService } from "./sms.service";

const CODE_EXPIRY_MINUTES = 10;

interface VerifiablePhoneProfile {
  id: string;
  phoneVerificationCode: string | null;
  phoneVerificationExpiresAt: Date | null;
}

@Injectable()
export class PhoneVerificationService {
  constructor(
    private prisma: PrismaService,
    @Inject(SMS_SERVICE) private smsService: SmsService,
  ) {}

  private async findProfile(user: RequestUser): Promise<VerifiablePhoneProfile> {
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

  private updateProfile(user: RequestUser, id: string, data: Record<string, unknown>) {
    if (user.role === "COMPANY") return this.prisma.companyProfile.update({ where: { id }, data });
    if (user.role === "SUPPLIER") return this.prisma.supplierProfile.update({ where: { id }, data });
    return this.prisma.subcontractorProfile.update({ where: { id }, data });
  }

  async sendCode(user: RequestUser, phone: string) {
    const profile = await this.findProfile(user);

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await this.updateProfile(user, profile.id, {
      phone,
      phoneVerificationCode: code,
      phoneVerificationExpiresAt: expiresAt,
      phoneVerifiedAt: null,
    });

    await this.smsService.sendVerificationCode(phone, code);
    return { success: true };
  }

  async verifyCode(user: RequestUser, code: string) {
    const profile = await this.findProfile(user);

    if (
      !profile.phoneVerificationCode ||
      !profile.phoneVerificationExpiresAt ||
      profile.phoneVerificationExpiresAt < new Date()
    ) {
      throw new BadRequestException("Kod süresi dolmuş, yeniden gönder");
    }
    if (profile.phoneVerificationCode !== code) {
      throw new BadRequestException("Kod hatalı");
    }

    await this.updateProfile(user, profile.id, {
      phoneVerifiedAt: new Date(),
      phoneVerificationCode: null,
      phoneVerificationExpiresAt: null,
    });

    return { success: true };
  }
}