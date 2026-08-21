import { Injectable, Logger } from "@nestjs/common";

export interface EmailService {
  sendPasswordResetLink(email: string, resetUrl: string): Promise<void>;
}

export const EMAIL_SERVICE = "EMAIL_SERVICE";

/**
 * Gerçek bir e-posta sağlayıcısı (SendGrid, Postmark, SES vb.) seçilene kadar
 * kullanılan geçici uygulama — e-postayı göndermek yerine sadece loglar.
 * Sağlayıcı netleşince bu sınıfın yerine gerçek bir implementasyon geçirilip
 * auth.module.ts'teki provider değiştirilecek.
 */
@Injectable()
export class ConsoleEmailService implements EmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async sendPasswordResetLink(email: string, resetUrl: string): Promise<void> {
    this.logger.warn(
      `[E-POSTA SAĞLAYICI YOK — geliştirme modu] ${email} adresine gönderilecek şifre sıfırlama linki: ${resetUrl}`,
    );
  }
}