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
  private readonly fromAddress: string;
  // `new Resend()` throws immediately if no API key is passed, which would
  // crash the whole app at boot since Nest eagerly instantiates every
  // provider — this class is registered regardless of whether a key is
  // configured (see auth.module.ts), so the client is built lazily on first
  // actual send instead of in the constructor.
  private client: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    // Kendi alan adımız Resend'de doğrulanana kadar Resend'in paylaşımlı test
    // alan adı kullanılıyor — bu adres herhangi bir alıcıya gönderim yapabilir,
    // sadece "gönderen" görünen adı imeceburada.com değil resend.dev olur.
    this.fromAddress = this.config.get<string>("RESEND_FROM_ADDRESS") ?? "İmece Burada <onboarding@resend.dev>";
  }

  private getClient(): Resend {
    if (!this.client) {
      const apiKey = this.config.get<string>("RESEND_API_KEY");
      if (!apiKey) throw new Error("RESEND_API_KEY tanımlı değil");
      this.client = new Resend(apiKey);
    }
    return this.client;
  }

  async sendPasswordResetLink(email: string, resetUrl: string): Promise<void> {
    const { error } = await this.getClient().emails.send({
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
