import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { TaxonomyService } from "../taxonomy/taxonomy.service";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { RegisterCompanyDto } from "./dto/register-company.dto";
import { RegisterSupplierDto } from "./dto/register-supplier.dto";
import { RegisterSubcontractorDto } from "./dto/register-subcontractor.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { AuthResponse, AuthTokens, UserRole } from "@imeceburada/shared";
import { EMAIL_SERVICE, EmailService } from "./email.service";

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private taxonomyService: TaxonomyService,
    @Inject(EMAIL_SERVICE) private emailService: EmailService,
  ) {}

  async registerCandidate(dto: RegisterCandidateDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    await this.assertPhoneAvailable(dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: "CANDIDATE",
        candidateProfile: {
          create: {
            fullName: dto.fullName,
            city: dto.city,
            district: dto.district,
            phone: dto.phone,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async registerCompany(dto: RegisterCompanyDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    await this.assertPhoneAvailable(dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: "COMPANY",
        companyProfile: {
          create: {
            companyName: dto.companyName,
            city: dto.city,
            district: dto.district,
            sector: dto.sector,
            phone: dto.phone,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async registerSupplier(dto: RegisterSupplierDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    await this.assertPhoneAvailable(dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const supplyCategories = dto.supplyCategories
      ? await this.taxonomyService.resolveOrQueueTerms("MATERIAL_CATEGORY_ITEM", dto.supplyCategories, null)
      : [];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: "SUPPLIER",
        supplierProfile: {
          create: {
            companyName: dto.companyName,
            city: dto.city,
            district: dto.district,
            supplyCategories,
            phone: dto.phone,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async registerSubcontractor(dto: RegisterSubcontractorDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    await this.assertPhoneAvailable(dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const tradeCategories = await this.taxonomyService.resolveOrQueueTerms(
      "TRADE_PROFESSION",
      dto.tradeCategories,
      null,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: "SUBCONTRACTOR",
        subcontractorProfile: {
          create: {
            companyName: dto.companyName,
            city: dto.city,
            district: dto.district,
            tradeCategories,
            description: dto.description,
            phone: dto.phone,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  /**
   * Kimlik alanı (identifier) e-posta ya da telefon numarası olabilir —
   * "@" içeriyorsa e-posta olarak, aksi halde telefon olarak aranır.
   * İkisi de aynı şifreyle çalışır, ekstra doğrulama kodu istenmez.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const isEmail = dto.identifier.includes("@");
    const identity = isEmail
      ? await this.prisma.user.findUnique({ where: { email: dto.identifier } })
      : await this.findUserIdentityByPhone(dto.identifier);
    if (!identity) throw new UnauthorizedException("Bilgiler hatalı");

    const user = await this.prisma.user.findUnique({ where: { id: identity.id } });
    if (!user) throw new UnauthorizedException("Bilgiler hatalı");

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("Bilgiler hatalı");

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.signTokens(user.id);
    } catch {
      throw new UnauthorizedException("Geçersiz veya süresi dolmuş refresh token");
    }
  }

  /**
   * Kullanıcı numaralandırmasını önlemek için e-posta sistemde olsun ya da
   * olmasın her zaman aynı genel başarı cevabı döner.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
        },
      });
      const webBaseUrl = this.config.get<string>("WEB_BASE_URL") ?? "http://localhost:3000";
      await this.emailService.sendPasswordResetLink(user.email, `${webBaseUrl}/reset-password?token=${rawToken}`);
    }
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: true }> {
    const tokenHash = createHash("sha256").update(dto.token).digest("hex");
    const user = await this.prisma.user.findFirst({
      where: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { gt: new Date() } },
    });
    if (!user) throw new UnauthorizedException("Geçersiz veya süresi dolmuş sıfırlama linki");

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
    return { success: true };
  }

  private async assertEmailAvailable(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Bu e-posta zaten kayıtlı");
  }

  /**
   * Telefon numarası giriş sırasında hesabı tekil olarak bulabilmek için
   * hesaplar arasında eşsiz olmalı — bu yüzden kayıt sırasında (doğrulama
   * yapılmasa bile) başka bir hesapta zaten kullanılmadığını kontrol eder.
   */
  private async assertPhoneAvailable(phone: string): Promise<void> {
    const [candidate, company, supplier, subcontractor] = await Promise.all([
      this.prisma.candidateProfile.findFirst({ where: { phone } }),
      this.prisma.companyProfile.findFirst({ where: { phone } }),
      this.prisma.supplierProfile.findFirst({ where: { phone } }),
      this.prisma.subcontractorProfile.findFirst({ where: { phone } }),
    ]);
    if (candidate ?? company ?? supplier ?? subcontractor) {
      throw new ConflictException("Bu telefon numarası başka bir hesapta kullanılıyor");
    }
  }

  /** Girişte telefon numarasından hangi kullanıcıya ait olduğunu bulur (doğrulanmış olma şartı yok). */
  private async findUserIdentityByPhone(
    phone: string,
  ): Promise<{ id: string; email: string; role: UserRole } | null> {
    const [candidate, company, supplier, subcontractor] = await Promise.all([
      this.prisma.candidateProfile.findFirst({ where: { phone }, include: { user: true } }),
      this.prisma.companyProfile.findFirst({ where: { phone }, include: { user: true } }),
      this.prisma.supplierProfile.findFirst({ where: { phone }, include: { user: true } }),
      this.prisma.subcontractorProfile.findFirst({ where: { phone }, include: { user: true } }),
    ]);
    const match = candidate ?? company ?? supplier ?? subcontractor;
    return (match?.user as { id: string; email: string; role: UserRole } | undefined) ?? null;
  }

  private signTokens(userId: string): AuthTokens {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m",
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d",
      },
    );
    return { accessToken, refreshToken };
  }

  private buildAuthResponse(id: string, email: string, role: UserRole): AuthResponse {
    const tokens = this.signTokens(id);
    return { ...tokens, user: { id, email, role } };
  }
}
