import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes, randomInt } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { RegisterCompanyDto } from "./dto/register-company.dto";
import { RegisterSupplierDto } from "./dto/register-supplier.dto";
import { RegisterSubcontractorDto } from "./dto/register-subcontractor.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RequestPhoneLoginDto } from "./dto/request-phone-login.dto";
import { VerifyPhoneLoginDto } from "./dto/verify-phone-login.dto";
import { RequestRegistrationPhoneCodeDto } from "./dto/request-registration-phone-code.dto";
import { RequestRegistrationEmailCodeDto } from "./dto/request-registration-email-code.dto";
import { AuthResponse, AuthTokens, UserRole } from "@imeceburada/shared";
import { EMAIL_SERVICE, EmailService } from "./email.service";
import { SMS_SERVICE, SmsService } from "../phone-verification/sms.service";

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const PHONE_LOGIN_CODE_TTL_MS = 10 * 60 * 1000;
const REGISTRATION_PHONE_CODE_TTL_MS = 10 * 60 * 1000;
const REGISTRATION_EMAIL_CODE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    @Inject(EMAIL_SERVICE) private emailService: EmailService,
    @Inject(SMS_SERVICE) private smsService: SmsService,
  ) {}

  async registerCandidate(dto: RegisterCandidateDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    const phoneVerifiedAt = await this.verifyRegistrationIdentity(dto);
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
            phoneVerifiedAt,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async registerCompany(dto: RegisterCompanyDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    const phoneVerifiedAt = await this.verifyRegistrationIdentity(dto);
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
            phoneVerifiedAt,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async registerSupplier(dto: RegisterSupplierDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    const phoneVerifiedAt = await this.verifyRegistrationIdentity(dto);
    const passwordHash = await bcrypt.hash(dto.password, 10);

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
            supplyCategories: dto.supplyCategories ?? [],
            phone: dto.phone,
            phoneVerifiedAt,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async registerSubcontractor(dto: RegisterSubcontractorDto): Promise<AuthResponse> {
    await this.assertEmailAvailable(dto.email);
    const phoneVerifiedAt = await this.verifyRegistrationIdentity(dto);
    const passwordHash = await bcrypt.hash(dto.password, 10);

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
            tradeCategories: dto.tradeCategories,
            description: dto.description,
            phone: dto.phone,
            phoneVerifiedAt,
          },
        },
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role as UserRole);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("E-posta veya şifre hatalı");

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("E-posta veya şifre hatalı");

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

  /**
   * Telefonuyla giriş için telefon numarasını hangi kullanıcıya ait olduğunu
   * bulur. Sadece profili doğrulanmış (phoneVerifiedAt dolu) hesaplar için
   * çalışır — CANDIDATE'ler için henüz telefon doğrulama akışı yok, o yüzden
   * kapsam dışında.
   */
  private async findUserByVerifiedPhone(
    phone: string,
  ): Promise<{ id: string; email: string; role: UserRole } | null> {
    const candidate = await this.prisma.candidateProfile.findFirst({
      where: { phone, phoneVerifiedAt: { not: null } },
      include: { user: true },
    });
    if (candidate) return candidate.user as { id: string; email: string; role: UserRole };

    const company = await this.prisma.companyProfile.findFirst({
      where: { phone, phoneVerifiedAt: { not: null } },
      include: { user: true },
    });
    if (company) return company.user as { id: string; email: string; role: UserRole };

    const supplier = await this.prisma.supplierProfile.findFirst({
      where: { phone, phoneVerifiedAt: { not: null } },
      include: { user: true },
    });
    if (supplier) return supplier.user as { id: string; email: string; role: UserRole };

    const subcontractor = await this.prisma.subcontractorProfile.findFirst({
      where: { phone, phoneVerifiedAt: { not: null } },
      include: { user: true },
    });
    if (subcontractor) return subcontractor.user as { id: string; email: string; role: UserRole };

    return null;
  }

  /**
   * Numara enumerasyonunu önlemek için telefon sistemde olsun ya da olmasın
   * her zaman aynı genel başarı cevabı döner (forgotPassword ile aynı desen).
   */
  async requestPhoneLogin(dto: RequestPhoneLoginDto): Promise<{ success: true }> {
    const user = await this.findUserByVerifiedPhone(dto.phone);
    if (user) {
      const code = randomInt(100000, 1000000).toString();
      const codeHash = createHash("sha256").update(code).digest("hex");
      await this.prisma.phoneLoginCode.upsert({
        where: { userId: user.id },
        create: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + PHONE_LOGIN_CODE_TTL_MS) },
        update: { codeHash, expiresAt: new Date(Date.now() + PHONE_LOGIN_CODE_TTL_MS) },
      });
      await this.smsService.sendVerificationCode(dto.phone, code);
    }
    return { success: true };
  }

  async verifyPhoneLogin(dto: VerifyPhoneLoginDto): Promise<AuthResponse> {
    const user = await this.findUserByVerifiedPhone(dto.phone);
    if (!user) throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");

    const record = await this.prisma.phoneLoginCode.findUnique({ where: { userId: user.id } });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");
    }
    const codeHash = createHash("sha256").update(dto.code).digest("hex");
    if (record.codeHash !== codeHash) {
      throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");
    }

    await this.prisma.phoneLoginCode.delete({ where: { userId: user.id } });
    return this.buildAuthResponse(user.id, user.email, user.role);
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
   * Bir telefon numarasının başka bir (varsa) hesapta zaten doğrulanmış
   * olup olmadığını kontrol eder — aynı numarayla ikinci bir hesap
   * (farklı rolde olsa dahi) açılmasını engellemek için kullanılır.
   * `excludeUserId` verilirse o kullanıcının kendi profili göz ardı edilir
   * (mevcut bir hesabın telefonunu tekrar doğrularken kendine çarpmasın diye).
   */
  private async assertPhoneNotVerifiedElsewhere(phone: string, excludeUserId?: string): Promise<void> {
    const [candidate, company, supplier, subcontractor] = await Promise.all([
      this.prisma.candidateProfile.findFirst({ where: { phone, phoneVerifiedAt: { not: null } } }),
      this.prisma.companyProfile.findFirst({ where: { phone, phoneVerifiedAt: { not: null } } }),
      this.prisma.supplierProfile.findFirst({ where: { phone, phoneVerifiedAt: { not: null } } }),
      this.prisma.subcontractorProfile.findFirst({ where: { phone, phoneVerifiedAt: { not: null } } }),
    ]);
    const match = candidate ?? company ?? supplier ?? subcontractor;
    if (match && match.userId !== excludeUserId) {
      throw new ConflictException("Bu telefon numarası başka bir hesapta kullanılıyor");
    }
  }

  /**
   * Kayıt formundan gönderilen telefon + kodu doğrular, kullanılan kodu
   * siler ve doğrulama zamanını döner — registerX metotları bunu doğrudan
   * profilin phoneVerifiedAt alanına yazar (kayıt anında zaten doğrulanmış
   * sayılır, ayrıca profil-bazlı doğrulama akışından geçmesi gerekmez).
   */
  private async consumeRegistrationPhoneCode(phone: string, code: string): Promise<Date> {
    const record = await this.prisma.registrationPhoneCode.findUnique({ where: { phone } });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");
    }
    const codeHash = createHash("sha256").update(code).digest("hex");
    if (record.codeHash !== codeHash) {
      throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");
    }
    // Kod gönderildikten sonra biri aynı numarayı başka bir hesapta
    // doğrulamış olabilir — silmeden hemen önce bir kez daha kontrol et.
    await this.assertPhoneNotVerifiedElsewhere(phone);
    await this.prisma.registrationPhoneCode.delete({ where: { phone } });
    return new Date();
  }

  async requestRegistrationPhoneCode(dto: RequestRegistrationPhoneCodeDto): Promise<{ success: true }> {
    await this.assertPhoneNotVerifiedElsewhere(dto.phone);

    const code = randomInt(100000, 1000000).toString();
    const codeHash = createHash("sha256").update(code).digest("hex");
    await this.prisma.registrationPhoneCode.upsert({
      where: { phone: dto.phone },
      create: { phone: dto.phone, codeHash, expiresAt: new Date(Date.now() + REGISTRATION_PHONE_CODE_TTL_MS) },
      update: { codeHash, expiresAt: new Date(Date.now() + REGISTRATION_PHONE_CODE_TTL_MS) },
    });
    await this.smsService.sendVerificationCode(dto.phone, code);
    return { success: true };
  }

  async requestRegistrationEmailCode(dto: RequestRegistrationEmailCodeDto): Promise<{ success: true }> {
    // E-posta zaten kayıtlıysa kod göndermenin anlamı yok, kayıt son adımda
    // zaten reddedilecek — burada erken ve net bir hata dönmek daha iyi UX.
    await this.assertEmailAvailable(dto.email);

    const code = randomInt(100000, 1000000).toString();
    const codeHash = createHash("sha256").update(code).digest("hex");
    await this.prisma.registrationEmailCode.upsert({
      where: { email: dto.email },
      create: { email: dto.email, codeHash, expiresAt: new Date(Date.now() + REGISTRATION_EMAIL_CODE_TTL_MS) },
      update: { codeHash, expiresAt: new Date(Date.now() + REGISTRATION_EMAIL_CODE_TTL_MS) },
    });
    await this.emailService.sendVerificationCode(dto.email, code);
    return { success: true };
  }

  private async consumeRegistrationEmailCode(email: string, code: string): Promise<void> {
    const record = await this.prisma.registrationEmailCode.findUnique({ where: { email } });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");
    }
    const codeHash = createHash("sha256").update(code).digest("hex");
    if (record.codeHash !== codeHash) {
      throw new UnauthorizedException("Kod hatalı veya süresi dolmuş");
    }
    await this.prisma.registrationEmailCode.delete({ where: { email } });
  }

  /**
   * Kayıt sırasında kimlik doğrulaması iki yoldan biriyle yapılır: telefon
   * (phone+phoneCode, SMS ile) ya da e-posta (emailCode). İkisinden tam
   * olarak biri gönderilmiş olmalı. Telefon yolunda profile yazılacak
   * phoneVerifiedAt zamanını döner; e-posta yolunda null döner (telefon
   * numarası hiç kaydedilmez, sonradan profilden ayrıca doğrulanabilir).
   */
  private async verifyRegistrationIdentity(dto: {
    email: string;
    phone?: string;
    phoneCode?: string;
    emailCode?: string;
  }): Promise<Date | null> {
    const hasPhone = Boolean(dto.phone && dto.phoneCode);
    const hasEmail = Boolean(dto.emailCode);
    if (hasPhone === hasEmail) {
      throw new BadRequestException("Telefon veya e-posta doğrulamasından tam olarak birini tamamlaman gerekiyor");
    }
    if (hasPhone) {
      return this.consumeRegistrationPhoneCode(dto.phone!, dto.phoneCode!);
    }
    await this.consumeRegistrationEmailCode(dto.email, dto.emailCode!);
    return null;
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