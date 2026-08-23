"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CompanyMembershipDto,
  InitiateCheckoutResponse,
  MEMBERSHIP_PLANS,
  MembershipPlan,
  TURKISH_PROVINCES,
} from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass, selectClass } from "@/components/form";
import { IyzicoCheckoutForm } from "@/components/iyzico-checkout-form";
import { useLocale } from "@/lib/i18n/locale-context";

function PhoneVerification({ onVerified }: { onVerified: () => void }) {
  const { authFetch } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/companies/me/phone/send-code", { method: "POST", body: JSON.stringify({ phone }) });
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kod gönderilemedi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/companies/me/phone/verify", { method: "POST", body: JSON.stringify({ code }) });
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kod doğrulanamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 p-6">
      <h2 className="mb-2 text-lg font-semibold text-silver-300">Telefon Doğrulama</h2>
      <p className="mb-4 text-sm text-silver-500">
        Üyelik için önce telefon numaranı doğrulaman gerekiyor. (Şu an bir SMS sağlayıcısı bağlı değil —
        geliştirme modunda kod sunucu loguna yazılır; sana test için ayrıca göstereceğiz.)
      </p>
      {step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <Field label="Telefon Numarası (+90...)">
            <input
              required
              placeholder="+905551234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gold-500 px-4 py-2 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? "Gönderiliyor..." : "Kod Gönder"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-3">
          <Field label="Doğrulama Kodu (6 haneli)">
            <input
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gold-500 px-4 py-2 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {isSubmitting ? "Doğrulanıyor..." : "Doğrula"}
          </button>
        </form>
      )}
    </div>
  );
}

function CheckoutSection() {
  const { authFetch } = useAuth();
  const [plan, setPlan] = useState<MembershipPlan>("MONTHLY");
  const [identityNumber, setIdentityNumber] = useState("");
  const [billingContactName, setBillingContactName] = useState("");
  const [billingCity, setBillingCity] = useState(TURKISH_PROVINCES[0]);
  const [billingAddress, setBillingAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<InitiateCheckoutResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authFetch<InitiateCheckoutResponse>("/membership/checkout", {
        method: "POST",
        body: JSON.stringify({ plan, identityNumber, billingContactName, billingCity, billingAddress }),
      });
      setCheckout(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ödeme başlatılamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkout) {
    return (
      <div className="rounded-lg border border-ink-800 bg-ink-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-silver-300">Ödeme</h2>
        <IyzicoCheckoutForm content={checkout.checkoutFormContent} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-silver-300">Üyelik Planı Seç</h2>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {MEMBERSHIP_PLANS.map((p) => (
          <button
            key={p.plan}
            type="button"
            onClick={() => setPlan(p.plan)}
            className={`rounded-md border p-4 text-start ${
              plan === p.plan ? "border-gold-500 bg-ink-800" : "border-ink-700"
            }`}
          >
            <p className="font-medium text-silver-200">{p.label}</p>
            <p className="text-sm text-gold-400">{p.priceLabel}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="TCKN / VKN">
          <input
            required
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Fatura Yetkilisi Ad Soyad">
          <input
            required
            value={billingContactName}
            onChange={(e) => setBillingContactName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Fatura Şehri">
          <select value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={selectClass}>
            {TURKISH_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fatura Adresi">
          <input
            required
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? "Yönlendiriliyor..." : "Ödemeye Geç"}
        </button>
      </form>
    </div>
  );
}

export default function MembershipPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [phoneJustVerified, setPhoneJustVerified] = useState(false);

  const { data: membership, isLoading } = useQuery({
    queryKey: ["membership-me"],
    queryFn: () => authFetch<CompanyMembershipDto>("/membership/me"),
    enabled: user?.role === "COMPANY" || user?.role === "SUPPLIER" || user?.role === "SUBCONTRACTOR",
  });

  useEffect(() => {
    if (phoneJustVerified) queryClient.invalidateQueries({ queryKey: ["membership-me"] });
  }, [phoneJustVerified, queryClient]);

  if (authLoading) return <p className="text-silver-500">Yükleniyor...</p>;
  if (user?.role !== "COMPANY" && user?.role !== "SUPPLIER" && user?.role !== "SUBCONTRACTOR") {
    return <p className="text-silver-500">Üyelik yalnızca firma, yapı tedarik ve taşeron firma hesapları içindir.</p>;
  }

  if (isLoading) return <p className="text-silver-500">Yükleniyor...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.membershipHeading")}</h1>

      {membership?.status === "ACTIVE" ? (
        <div className="rounded-lg border border-gold-500/40 bg-ink-900 p-6">
          <p className="text-lg font-medium text-gold-400">Üyeliğin aktif ✓</p>
          {membership.expiresAt && (
            <p className="mt-2 text-sm text-silver-500">
              Bitiş tarihi: {new Date(membership.expiresAt).toLocaleDateString("tr-TR")}
            </p>
          )}
        </div>
      ) : !membership?.phoneVerified ? (
        <PhoneVerification onVerified={() => setPhoneJustVerified(true)} />
      ) : (
        <CheckoutSection />
      )}
    </div>
  );
}