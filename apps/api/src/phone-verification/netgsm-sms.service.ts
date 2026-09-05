import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SmsService } from "./sms.service";

/**
 * Netgsm (https://www.netgsm.com.tr) REST API üzerinden gerçek SMS gönderen
 * implementasyon. NETGSM_USERCODE / NETGSM_PASSWORD / NETGSM_HEADER ortam
 * değişkenleri tanımlıysa auth.module.ts ve phone-verification.module.ts bunu,
 * tanımlı değilse ConsoleSmsService'i devreye alır.
 *
 * NOT: Bu servis gerçek Netgsm hesap bilgileri olmadan test edilemedi —
 * https://www.netgsm.com.tr/dokuman/ adresindeki resmi REST API
 * dokümantasyonuna göre yazıldı. Gerçek kullanıcı kodu/şifre eklenince
 * uçtan uca doğrulanmalı.
 *
 * ÖNEMLİ: Resend entegrasyonunda yaşanan çökme olayından ders alınarak,
 * dış servis istemcisi burada kurulmuyor — sadece config'ten okunan
 * değerler ile her çağrıda düz bir HTTP isteği atılıyor. Böylece
 * NETGSM_* değişkenleri tanımlı olmasa bile bu servis Nest tarafından
 * sorunsuz instantiate edilir; hata sadece gerçekten SMS göndermeye
 * çalışıldığında (ve o an da eksikse) fırlatılır.
 */
@Injectable()
export class NetgsmSmsService implements SmsService {
  private readonly logger = new Logger(NetgsmSmsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const usercode = this.config.get<string>("NETGSM_USERCODE");
    const password = this.config.get<string>("NETGSM_PASSWORD");
    const header = this.config.get<string>("NETGSM_HEADER");
    if (!usercode || !password || !header) {
      throw new Error("NETGSM_USERCODE / NETGSM_PASSWORD / NETGSM_HEADER tanımlı değil");
    }

    // Türkiye'de yaygın 05XX / +905XX / 905XX formatlarını Netgsm'in beklediği
    // başında sıfır olmayan 90'lı formata (905XXXXXXXXX) normalize eder.
    const normalizedPhone = phone.replace(/\D/g, "").replace(/^0/, "90").replace(/^(?!90)/, "90");

    const res = await fetch("https://api.netgsm.com.tr/sms/send/get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        usercode,
        password,
        gsmno: normalizedPhone,
        message: `İmece Burada doğrulama kodun: ${code}`,
        msgheader: header,
      }),
    });

    const body = (await res.text()).trim();
    // Netgsm başarılı gönderimde "00 <messageId>" gibi 00 ile başlayan bir
    // kod döner; hata kodları (20, 30, 40, 50, 51, 70, 85...) farklıdır.
    if (!res.ok || !body.startsWith("00")) {
      this.logger.error(`Netgsm SMS gönderilemedi (${phone}): ${body}`);
      throw new Error("SMS gönderilemedi");
    }
  }
}
