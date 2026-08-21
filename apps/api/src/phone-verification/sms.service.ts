import { Injectable, Logger } from "@nestjs/common";

export interface SmsService {
  sendVerificationCode(phone: string, code: string): Promise<void>;
}

export const SMS_SERVICE = "SMS_SERVICE";

/**
 * Gerçek bir SMS sağlayıcısı (Netgsm, İleti Merkezi, Twilio vb.) seçilene
 * kadar kullanılan geçici uygulama — kodu göndermek yerine sadece loglar.
 * Sağlayıcı netleşince bu sınıfın yerine gerçek bir implementasyon geçirilip
 * phone-verification.module.ts'teki provider değiştirilecek.
 */
@Injectable()
export class ConsoleSmsService implements SmsService {
  private readonly logger = new Logger(ConsoleSmsService.name);

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    this.logger.warn(
      `[SMS SAĞLAYICI YOK — geliştirme modu] ${phone} numarasına gönderilecek doğrulama kodu: ${code}`,
    );
  }
}