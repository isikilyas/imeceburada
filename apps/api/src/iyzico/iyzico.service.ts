import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export interface IyzicoCustomer {
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  identityNumber: string;
}

export interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface InitializeCheckoutParams {
  pricingPlanReferenceCode: string;
  customer: IyzicoCustomer;
  billingAddress: IyzicoAddress;
  callbackUrl: string;
  conversationId: string;
}

export interface InitializeCheckoutResult {
  status: string;
  token: string;
  checkoutFormContent: string;
  tokenExpireTime: number;
}

/**
 * iyzico Abonelik (Subscription) API v2 istemcisi. Ham HTTP çağrıları yapar
 * (resmi `iyzipay` paketi bu v2 uçlarını desteklemiyor), imzalama iyzico'nun
 * HMACSHA256 kimlik doğrulama şemasına göre yapılır.
 *
 * NOT: Bu servis gerçek sandbox API anahtarları olmadan test edilemedi —
 * https://docs.iyzico.com adresindeki resmi dokümantasyona göre yazıldı.
 * Sandbox anahtarları eklenince uçtan uca doğrulanmalı.
 */
@Injectable()
export class IyzicoService {
  private readonly logger = new Logger(IyzicoService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly merchantId: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>("IYZICO_API_KEY") ?? "";
    this.secretKey = this.config.get<string>("IYZICO_SECRET_KEY") ?? "";
    this.merchantId = this.config.get<string>("IYZICO_MERCHANT_ID") ?? "";
    this.baseUrl =
      this.config.get<string>("IYZICO_BASE_URL") ?? "https://sandbox-api.iyzipay.com";
  }

  private buildAuthorizationHeader(uriPath: string, body?: unknown): string {
    const randomKey = `${Date.now()}${crypto.randomBytes(8).toString("hex")}`;
    const payload = randomKey + uriPath + (body ? JSON.stringify(body) : "");
    const signature = crypto.createHmac("sha256", this.secretKey).update(payload).digest("hex");
    const authString = `apiKey:${this.apiKey}&randomKey:${randomKey}&signature:${signature}`;
    return `IYZWSv2 ${Buffer.from(authString, "utf-8").toString("base64")}`;
  }

  private async request<T>(method: "GET" | "POST" | "DELETE", uriPath: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${uriPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.buildAuthorizationHeader(uriPath, body),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok || json.status === "failure") {
      this.logger.error(`iyzico ${method} ${uriPath} failed: ${JSON.stringify(json)}`);
      throw new Error(json.errorMessage ?? "iyzico isteği başarısız oldu");
    }
    return json.data as T;
  }

  createProduct(name: string, description?: string) {
    return this.request<{ referenceCode: string }>("POST", "/v2/subscription/products", {
      name,
      description,
      locale: "tr",
    });
  }

  createPricingPlan(
    productReferenceCode: string,
    params: {
      name: string;
      price: string;
      currencyCode: "TRY";
      paymentInterval: "MONTHLY" | "YEARLY";
      trialPeriodDays?: number;
    },
  ) {
    return this.request<{ referenceCode: string }>(
      "POST",
      `/v2/subscription/products/${productReferenceCode}/pricing-plans`,
      {
        ...params,
        planPaymentType: "RECURRING",
        locale: "tr",
      },
    );
  }

  initializeCheckout(params: InitializeCheckoutParams) {
    return this.request<InitializeCheckoutResult>("POST", "/v2/subscription/checkoutform/initialize", {
      locale: "tr",
      conversationId: params.conversationId,
      pricingPlanReferenceCode: params.pricingPlanReferenceCode,
      subscriptionInitialStatus: "ACTIVE",
      callbackUrl: params.callbackUrl,
      customer: params.customer,
      billingAddress: params.billingAddress,
    });
  }

  /**
   * Ödeme tamamlandıktan sonra callbackUrl'e dönen token ile abonelik
   * sonucunu sorgular. NOT: Bu endpoint yolu resmi dokümantasyonda net
   * bulunamadı, v2 API'nin genel deseninden çıkarıldı — gerçek sandbox
   * anahtarlarıyla doğrulanmalı.
   */
  retrieveCheckoutFormResult(token: string) {
    return this.request<{
      subscriptionReferenceCode: string;
      status: string;
    }>("GET", `/v2/subscription/checkoutform/${token}`);
  }

  cancelSubscription(subscriptionReferenceCode: string) {
    return this.request<{ referenceCode: string }>(
      "POST",
      `/v2/subscription/subscriptions/${subscriptionReferenceCode}/cancel`,
    );
  }

  /**
   * Webhook doğrulaması: X-IYZ-SIGNATURE-V3 header'ı
   * HMAC-SHA256(merchantId + secretKey + eventType + subscriptionReferenceCode + orderReferenceCode + customerReferenceCode)
   * ile hesaplanır. iyzico tarafında imza doğrulamasının aktif edilmiş olması gerekir
   * (support@iyzico.com üzerinden talep edilir) — aksi halde bu alan boş gelebilir.
   */
  verifyWebhookSignature(params: {
    eventType: string;
    subscriptionReferenceCode: string;
    orderReferenceCode: string;
    customerReferenceCode: string;
    signatureHeader: string;
  }): boolean {
    const payload =
      this.merchantId +
      this.secretKey +
      params.eventType +
      params.subscriptionReferenceCode +
      params.orderReferenceCode +
      params.customerReferenceCode;
    const expected = crypto.createHmac("sha256", this.secretKey).update(payload).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf-8");
    const receivedBuf = Buffer.from(params.signatureHeader ?? "", "utf-8");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  }
}