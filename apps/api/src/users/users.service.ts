import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { unlink } from "fs/promises";
import { join } from "path";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { TaxonomyService } from "../taxonomy/taxonomy.service";
import { RequestUser } from "../auth/types/request-user";
import { EMAIL_SERVICE, EmailService } from "../email/email.service";
import { UpdateCandidateProfileDto } from "./dto/update-candidate-profile.dto";
import { UpdateCompanyProfileDto } from "./dto/update-company-profile.dto";
import { UpdateSubcontractorProfileDto } from "./dto/update-subcontractor-profile.dto";
import { UpdateSupplierProfileDto } from "./dto/update-supplier-profile.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { DeactivateAccountDto } from "./dto/deactivate-account.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RequestEmailChangeDto } from "./dto/request-email-change.dto";
import { ConfirmEmailChangeDto } from "./dto/confirm-email-change.dto";

const EMAIL_CHANGE_CODE_EXPIRY_MINUTES = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private taxonomyService: TaxonomyService,
    @Inject(EMAIL_SERVICE) private emailService: EmailService,
  ) {}

  async getMyProfile(user: RequestUser) {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");
    const account = {
      email: dbUser.email,
      username: dbUser.username,
      accountCreatedAt: dbUser.createdAt,
      lastLoginAt: dbUser.lastLoginAt,
      pendingEmail: dbUser.pendingEmail,
    };

    if (user.role === "CANDIDATE") {
      const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Aday profili bulunamadı");
      return { role: "CANDIDATE", ...account, ...profile };
    }
    if (user.role === "COMPANY") {
      const profile = await this.prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Şirket profili bulunamadı");
      return { role: "COMPANY", ...account, ...profile };
    }
    if (user.role === "SUBCONTRACTOR") {
      const profile = await this.prisma.subcontractorProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Taşeron profili bulunamadı");
      return { role: "SUBCONTRACTOR", ...account, ...profile };
    }
    if (user.role === "SUPPLIER") {
      const profile = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Yapı Tedarik profili bulunamadı");
      return { role: "SUPPLIER", ...account, ...profile };
    }
    throw new BadRequestException("Bu rol için profil bulunmuyor");
  }

  /** Oturum açıkken şifre değiştirme — mevcut şifre doğrulanır, yeni şifre hash'lenip kaydedilir. */
  async changePassword(user: RequestUser, dto: ChangePasswordDto): Promise<{ success: true }> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");

    const passwordMatches = await bcrypt.compare(dto.currentPassword, dbUser.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("Mevcut şifre hatalı");

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return { success: true };
  }

  /** İsteğe bağlı, herkese açık olmayan görünen kullanıcı adı — girişte kullanılmaz. */
  async updateUsername(user: RequestUser, username: string | null): Promise<{ success: true }> {
    if (username) {
      const existing = await this.prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== user.id) throw new ConflictException("Bu kullanıcı adı zaten alınmış");
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { username } });
    return { success: true };
  }

  /**
   * "Tüm cihazlardan çıkış yap" — stateless JWT'ler tek tek iptal edilemediği
   * için tokenVersion'ı artırarak daha önce dağıtılmış TÜM access/refresh
   * token'ları (mevcut oturum dahil) geçersiz kılar.
   */
  async logoutAllDevices(user: RequestUser): Promise<{ success: true }> {
    await this.prisma.user.update({ where: { id: user.id }, data: { tokenVersion: { increment: 1 } } });
    return { success: true };
  }

  /**
   * Hesabı geçici olarak dondurur — kalıcı silmeden farklı olarak geri
   * alınabilir. Dondurulmuş hesaplar JwtStrategy tarafından reddedilir ve
   * tüm dizin/ilan listelerinden gizlenir; bir sonraki başarılı girişte
   * (AuthService.login) otomatik olarak yeniden aktifleşir.
   */
  async deactivateAccount(user: RequestUser, dto: DeactivateAccountDto): Promise<{ success: true }> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");

    const passwordMatches = await bcrypt.compare(dto.password, dbUser.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("Şifre hatalı");

    await this.prisma.user.update({ where: { id: user.id }, data: { deactivatedAt: new Date() } });
    return { success: true };
  }

  /** E-posta değiştirmenin ilk adımı — yeni adrese doğrulama kodu gönderir, hesabın e-postası henüz değişmez. */
  async requestEmailChange(user: RequestUser, dto: RequestEmailChangeDto): Promise<{ success: true }> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");

    const passwordMatches = await bcrypt.compare(dto.password, dbUser.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("Şifre hatalı");

    const existing = await this.prisma.user.findUnique({ where: { email: dto.newEmail } });
    if (existing) throw new ConflictException("Bu e-posta zaten kayıtlı");

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + EMAIL_CHANGE_CODE_EXPIRY_MINUTES * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { pendingEmail: dto.newEmail, emailChangeCode: code, emailChangeExpiresAt: expiresAt },
    });
    await this.emailService.sendVerificationCode(dto.newEmail, code);
    return { success: true };
  }

  /** E-posta değiştirmenin ikinci adımı — kod doğrulanınca hesabın e-postası gerçekten değişir. */
  async confirmEmailChange(user: RequestUser, dto: ConfirmEmailChangeDto): Promise<{ success: true }> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");

    if (
      !dbUser.pendingEmail ||
      !dbUser.emailChangeCode ||
      !dbUser.emailChangeExpiresAt ||
      dbUser.emailChangeExpiresAt < new Date()
    ) {
      throw new BadRequestException("Kod süresi dolmuş, yeniden gönder");
    }
    if (dbUser.emailChangeCode !== dto.code) throw new BadRequestException("Kod hatalı");

    const stillAvailable = await this.prisma.user.findUnique({ where: { email: dbUser.pendingEmail } });
    if (stillAvailable) throw new ConflictException("Bu e-posta zaten kayıtlı");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { email: dbUser.pendingEmail, pendingEmail: null, emailChangeCode: null, emailChangeExpiresAt: null },
    });
    return { success: true };
  }

  async updateCandidateProfile(user: RequestUser, dto: UpdateCandidateProfileDto) {
    if (user.role !== "CANDIDATE") throw new BadRequestException("Sadece adaylar profil güncelleyebilir");
    const primaryTradeCategory = dto.primaryTradeCategory
      ? await this.taxonomyService.resolveOrQueueTerm("TRADE_PROFESSION", dto.primaryTradeCategory, user.id)
      : undefined;
    return this.prisma.candidateProfile.update({
      where: { userId: user.id },
      data: { ...dto, ...(primaryTradeCategory ? { primaryTradeCategory } : {}) },
    });
  }

  async updateCompanyProfile(user: RequestUser, dto: UpdateCompanyProfileDto) {
    if (user.role !== "COMPANY") throw new BadRequestException("Sadece şirketler profil güncelleyebilir");
    return this.prisma.companyProfile.update({ where: { userId: user.id }, data: dto });
  }

  async updateSubcontractorProfile(user: RequestUser, dto: UpdateSubcontractorProfileDto) {
    if (user.role !== "SUBCONTRACTOR") throw new BadRequestException("Sadece taşeron firmalar profil güncelleyebilir");
    const tradeCategories = dto.tradeCategories
      ? await this.taxonomyService.resolveOrQueueTerms("TRADE_PROFESSION", dto.tradeCategories, user.id)
      : undefined;
    return this.prisma.subcontractorProfile.update({
      where: { userId: user.id },
      data: { ...dto, ...(tradeCategories ? { tradeCategories } : {}) },
    });
  }

  async updateSupplierProfile(user: RequestUser, dto: UpdateSupplierProfileDto) {
    if (user.role !== "SUPPLIER") throw new BadRequestException("Sadece yapı tedarik firmaları profil güncelleyebilir");
    const supplyCategories = dto.supplyCategories
      ? await this.taxonomyService.resolveOrQueueTerms("MATERIAL_CATEGORY_ITEM", dto.supplyCategories, user.id)
      : undefined;
    return this.prisma.supplierProfile.update({
      where: { userId: user.id },
      data: { ...dto, ...(supplyCategories ? { supplyCategories } : {}) },
    });
  }

  async setCandidatePhoto(user: RequestUser, filename: string) {
    if (user.role !== "CANDIDATE") throw new BadRequestException("Sadece adaylar fotoğraf yükleyebilir");
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new NotFoundException("Aday profili bulunamadı");

    if (profile.photoUrl) {
      await unlink(join(process.cwd(), profile.photoUrl)).catch(() => undefined);
    }

    const photoUrl = `/uploads/candidates/${filename}`;
    return this.prisma.candidateProfile.update({ where: { userId: user.id }, data: { photoUrl } });
  }

  async removeCandidatePhoto(user: RequestUser) {
    if (user.role !== "CANDIDATE") throw new BadRequestException("Sadece adaylar fotoğraf kaldırabilir");
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new NotFoundException("Aday profili bulunamadı");

    if (profile.photoUrl) {
      await unlink(join(process.cwd(), profile.photoUrl)).catch(() => undefined);
    }
    return this.prisma.candidateProfile.update({ where: { userId: user.id }, data: { photoUrl: null } });
  }

  private async findCorporateLogoUrl(user: RequestUser): Promise<string | null> {
    if (user.role === "COMPANY") {
      const profile = await this.prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Firma profili bulunamadı");
      return profile.logoUrl;
    }
    if (user.role === "SUPPLIER") {
      const profile = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Firma profili bulunamadı");
      return profile.logoUrl;
    }
    if (user.role === "SUBCONTRACTOR") {
      const profile = await this.prisma.subcontractorProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Firma profili bulunamadı");
      return profile.logoUrl;
    }
    throw new BadRequestException("Sadece firma, tedarikçi veya taşeron hesapları logo yükleyebilir");
  }

  private updateCorporateLogoUrl(user: RequestUser, logoUrl: string | null) {
    if (user.role === "COMPANY") return this.prisma.companyProfile.update({ where: { userId: user.id }, data: { logoUrl } });
    if (user.role === "SUPPLIER") return this.prisma.supplierProfile.update({ where: { userId: user.id }, data: { logoUrl } });
    return this.prisma.subcontractorProfile.update({ where: { userId: user.id }, data: { logoUrl } });
  }

  async setCompanyLogo(user: RequestUser, filename: string) {
    const existingLogoUrl = await this.findCorporateLogoUrl(user);
    if (existingLogoUrl) {
      await unlink(join(process.cwd(), existingLogoUrl)).catch(() => undefined);
    }
    const logoUrl = `/uploads/company-logos/${filename}`;
    return this.updateCorporateLogoUrl(user, logoUrl);
  }

  async removeCompanyLogo(user: RequestUser) {
    const existingLogoUrl = await this.findCorporateLogoUrl(user);
    if (existingLogoUrl) {
      await unlink(join(process.cwd(), existingLogoUrl)).catch(() => undefined);
    }
    return this.updateCorporateLogoUrl(user, null);
  }

  async getCompanyProfileIdForUser(userId: string): Promise<string> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Şirket profili bulunamadı");
    return profile.id;
  }

  async getCandidateProfileIdForUser(userId: string): Promise<string> {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Aday profili bulunamadı");
    return profile.id;
  }

  /**
   * Hesabı ve ona bağlı HER ŞEYİ (profil, ilanlar, başvurular, üyelik geçmişi,
   * favoriler vb.) kalıcı olarak siler. Şema genelinde tüm ilişkiler
   * onDelete: Cascade olduğu için tek bir user.delete() tüm grafiği temizler.
   *
   * NOT: Aktif ücretli bir üyeliği varsa (iyzico abonelik), bu sadece yerel
   * kaydı siler — iyzico tarafındaki tekrarlayan ödemeyi iptal etmez. iyzico
   * entegrasyonu gerçek anahtarlarla canlıya alındığında burada bir iptal
   * çağrısı da eklenmeli.
   */
  async deleteMyAccount(user: RequestUser, dto: DeleteAccountDto): Promise<{ success: true }> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");

    const passwordMatches = await bcrypt.compare(dto.password, dbUser.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("Şifre hatalı");

    await this.prisma.user.delete({ where: { id: user.id } });
    return { success: true };
  }

  private summarizeProfile(dbUser: {
    candidateProfile: { fullName: string; isPublic: boolean; photoUrl: string | null } | null;
    companyProfile: {
      companyName: string;
      membershipStatus: string;
      membershipExpiresAt: Date | null;
      phoneVerifiedAt: Date | null;
    } | null;
    supplierProfile: {
      companyName: string;
      membershipStatus: string;
      membershipExpiresAt: Date | null;
      phoneVerifiedAt: Date | null;
    } | null;
    subcontractorProfile: {
      companyName: string;
      isPublic: boolean;
      membershipStatus: string;
      membershipExpiresAt: Date | null;
      phoneVerifiedAt: Date | null;
    } | null;
  }) {
    if (dbUser.candidateProfile) {
      return {
        displayName: dbUser.candidateProfile.fullName,
        isPublic: dbUser.candidateProfile.isPublic,
        photoUrl: dbUser.candidateProfile.photoUrl,
        membershipStatus: null,
        membershipExpiresAt: null,
        phoneVerified: false,
      };
    }
    const corporate = dbUser.companyProfile ?? dbUser.supplierProfile ?? dbUser.subcontractorProfile;
    if (corporate) {
      return {
        displayName: corporate.companyName,
        isPublic: "isPublic" in corporate ? corporate.isPublic : null,
        photoUrl: null,
        membershipStatus: corporate.membershipStatus,
        membershipExpiresAt: corporate.membershipExpiresAt,
        phoneVerified: !!corporate.phoneVerifiedAt,
      };
    }
    return { displayName: null, isPublic: null, photoUrl: null, membershipStatus: null, membershipExpiresAt: null, phoneVerified: false };
  }

  /**
   * Yönetici tarafında kullanıcı profillerinden asla dönmemesi gereken alanlar
   * (doğrulama kodları gibi transient/dahili veriler) — passwordHash zaten
   * User üzerinde ayrı tutulduğu ve buraya hiç seçilmediği için burada değil.
   */
  private static readonly ADMIN_CANDIDATE_SELECT = {
    id: true,
    fullName: true,
    phone: true,
    phoneVisible: true,
    phoneVerifiedAt: true,
    city: true,
    district: true,
    address: true,
    bio: true,
    experienceYears: true,
    skills: true,
    workPreferences: true,
    primaryTradeCategory: true,
    isPublic: true,
    photoUrl: true,
    photoVisible: true,
    availabilityStatus: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  private static readonly ADMIN_CORPORATE_SELECT = {
    id: true,
    companyName: true,
    phone: true,
    phoneVisible: true,
    phoneVerifiedAt: true,
    city: true,
    district: true,
    address: true,
    website: true,
    companyEmail: true,
    logoUrl: true,
    authorizedPersonName: true,
    taxOffice: true,
    taxNumber: true,
    mersisNumber: true,
    membershipStatus: true,
    membershipExpiresAt: true,
    isPremium: true,
    currentPlan: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  /**
   * Yönetici kullanıcı listesi — şifre hash'i ve dahili doğrulama kodları gibi
   * hassas alanlar asla döndürülmez, sadece hesap durumu/üyelik özetlenir.
   */
  async adminListUsers(query: { role?: string; q?: string; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      ...(query.role ? { role: query.role as never } : {}),
      ...(query.q ? { email: { contains: query.q, mode: "insensitive" as const } } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          deactivatedAt: true,
          candidateProfile: { select: { fullName: true, isPublic: true, photoUrl: true } },
          companyProfile: { select: { companyName: true, membershipStatus: true, membershipExpiresAt: true, phoneVerifiedAt: true } },
          supplierProfile: { select: { companyName: true, membershipStatus: true, membershipExpiresAt: true, phoneVerifiedAt: true } },
          subcontractorProfile: {
            select: { companyName: true, isPublic: true, membershipStatus: true, membershipExpiresAt: true, phoneVerifiedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        deactivatedAt: u.deactivatedAt,
        ...this.summarizeProfile(u),
      })),
      total,
      page,
      pageSize,
    };
  }

  async adminGetUserDetail(id: string) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        deactivatedAt: true,
        pendingEmail: true,
        candidateProfile: { select: UsersService.ADMIN_CANDIDATE_SELECT },
        companyProfile: { select: UsersService.ADMIN_CORPORATE_SELECT },
        supplierProfile: { select: { ...UsersService.ADMIN_CORPORATE_SELECT, supplyCategories: true } },
        subcontractorProfile: {
          select: { ...UsersService.ADMIN_CORPORATE_SELECT, tradeCategories: true, description: true, isPublic: true },
        },
      },
    });
    if (!dbUser) throw new NotFoundException("Kullanıcı bulunamadı");
    return dbUser;
  }
}
