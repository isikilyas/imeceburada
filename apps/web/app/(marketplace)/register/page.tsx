"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TRADE_FIELDS, TURKISH_PROVINCES, UserRole } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategoryMultiSelect } from "@/components/trade-category-multi-select";
import { MaterialCategoryMultiSelect } from "@/components/material-category-multi-select";
import { useLocale } from "@/lib/i18n/locale-context";

type RegisterableRole = Extract<UserRole, "CANDIDATE" | "COMPANY" | "SUPPLIER" | "SUBCONTRACTOR">;

const ROLE_LABELS: Record<RegisterableRole, string> = {
  CANDIDATE: "İş Arayan Personel",
  COMPANY: "Firma",
  SUPPLIER: "Yapı Tedarik",
  SUBCONTRACTOR: "Taşeron Firma",
};

export default function RegisterPage() {
  const { registerCandidate, registerCompany, registerSupplier, registerSubcontractor } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [role, setRole] = useState<RegisterableRole>("CANDIDATE");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [tradeCategories, setTradeCategories] = useState<string[]>([
    TRADE_FIELDS[0].branches[0].professions[0].value,
  ]);
  const [supplyCategories, setSupplyCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const districtValue = district || undefined;
      if (role === "CANDIDATE") {
        await registerCandidate({ email, password, fullName, city, district: districtValue });
      } else if (role === "COMPANY") {
        await registerCompany({ email, password, companyName, city, district: districtValue, sector: sector || undefined });
      } else if (role === "SUPPLIER") {
        await registerSupplier({
          email,
          password,
          companyName,
          city,
          district: districtValue,
          supplyCategories: supplyCategories.length > 0 ? supplyCategories : undefined,
        });
      } else {
        if (tradeCategories.length === 0) {
          setError("En az bir branş/meslek seçmelisin");
          setIsSubmitting(false);
          return;
        }
        await registerSubcontractor({
          email,
          password,
          companyName,
          city,
          district: districtValue,
          tradeCategories,
          description: description || undefined,
        });
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kayıt oluşturulamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.registerHeading")}</h1>

      <div className="mb-6 grid grid-cols-2 gap-2">
        {(Object.keys(ROLE_LABELS) as RegisterableRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-md px-2 py-2 text-xs font-medium leading-tight ${
              role === r ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-400"
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === "CANDIDATE" ? (
          <Field label="Ad Soyad">
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </Field>
        ) : role === "COMPANY" ? (
          <>
            <Field label="Firma Adı">
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Sektör (opsiyonel)">
              <input value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass} />
            </Field>
          </>
        ) : (
          <Field label="Firma Adı">
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
            />
          </Field>
        )}

        {role === "SUPPLIER" && (
          <>
            <p className="text-xs text-silver-500">
              Yapı Tedarik üyeliği sadece inşaat malzemesi ilanı vermek içindir — iş ilanı açamazsın. Tedarik
              ettiğin ürün/hizmet gruplarını seçmen isteğe bağlı, sonradan panelinden de ekleyebilirsin.
            </p>
            <MaterialCategoryMultiSelect values={supplyCategories} onChange={setSupplyCategories} />
          </>
        )}

        {role === "SUBCONTRACTOR" && (
          <>
            <p className="text-xs text-silver-500">
              Taşeron Firma üyeliği, hangi branşta taşeronluk yaptığını (örn. kalıp taşeronluğu) diğer firmaların
              seni bulabileceği şekilde ilan eder.
            </p>
            <TradeCategoryMultiSelect values={tradeCategories} onChange={setTradeCategories} />
            <Field label="Açıklama (opsiyonel)">
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                placeholder="Örn: Faturalı çalışırız, 10 kişilik ekibimiz var"
              />
            </Field>
          </>
        )}

        <ProvinceDistrictSelect city={city} district={district} onCityChange={setCity} onDistrictChange={setDistrict} />

        <Field label="E-posta">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Şifre (en az 8 karakter)">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="mt-4 text-sm text-silver-500">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="text-gold-400 hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}