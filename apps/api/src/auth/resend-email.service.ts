import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { EmailService } from "./email.service";

/**
 * Resend (https://resend.com) üzerinden gerçek e-posta gönderen implementasyon.
 * RESEND_API_KEY ortam değişkeni tanımlıysa auth.module.ts bunu, tanımlı
 * değilse (yerel geliştirme gibi) ConsoleEmailService'i devreye alır.
 */
@Injectable()
export class ResendEmailService implements EmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>("RESEND_API_KEY"));
    // Kendi alan adımız Resend'de doğrulanana kadar Resend'in paylaşımlı test
    // alan adı kullanılıyor — bu adres herhangi bir alıcıya gönderim yapabilir,
    // sadece "gönderen" görünen adı imeceburada.com değil resend.dev olur.
    this.fromAddress = this.config.get<string>("RESEND_FROM_ADDRESS") ?? "İmece Burada <onboarding@resend.dev>";
  }

  async sendPasswordResetLink(email: string, resetUrl: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to: email,
      subject: "İmece Burada — Şifre sıfırlama",
      html: `
        <p>Merhaba,</p>
        <p>İmece Burada hesabın için bir şifre sıfırlama isteği aldık. Aşağıdaki linke tıklayarak yeni bir şifre belirleyebilirsin:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin, hesabında bir değişiklik yapılmayacak.</p>
      `,
    });
    if (error) {
      this.logger.error(`Resend üzerinden e-posta gönderilemedi (${email}): ${JSON.stringify(error)}`);
      throw new Error("Şifre sıfırlama e-postası gönderilemedi");
    }
  }
}
