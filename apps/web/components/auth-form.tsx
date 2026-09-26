"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TRADE_FIELDS, TURKISH_PROVINCES, UserRole } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass, PasswordInput } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategoryMultiSelect } from "@/components/trade-category-multi-select";
import { MaterialCategoryMultiSelect } from "@/components/material-category-multi-select";
import { CompanyNameWarning } from "@/components/company-name-warning";
import { useLocale } from "@/lib/i18n/locale-context";

type RegisterableRole = Extract<UserRole, "CANDIDATE" | "COMPANY" | "SUPPLIER" | "SUBCONTRACTOR">;

const ROLE_LABELS: Record<RegisterableRole, string> = {
  CANDIDATE: "İş Arayan Personel",
  COMPANY: "Firma",
  SUPPLIER: "Yapı Tedarik",
  SUBCONTRACTOR: "Taşeron Firma",
};

const REMEMBERED_IDENTIFIER_KEY = "imeceburada.rememberedIdentifier";

interface AuthFormProps {
  defaultTab: "login" | "register";
}

export function AuthForm({ defaultTab }: AuthFormProps) {
  const { login, registerCandidate, registerCompany, registerSupplier, registerSubcontractor } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchTab(next: "login" | "register") {
    setTab(next);
    setError(null);
    router.replace(next === "login" ? "/login" : "/register", { scroll: false });
  }

  // Giriş alanları
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_IDENTIFIER_KEY);
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
    }
  }, []);

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (rememberMe) window.localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier);
      else window.localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
      await login({ identifier, password: loginPassword }, keepSignedIn);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş yapılamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Kayıt alanları
  const [role, setRole] = useState<RegisterableRole>("CANDIDATE");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
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

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const districtValue = district || undefined;
      if (role === "CANDIDATE") {
        await registerCandidate({ email, password: regPassword, fullName, city, district: districtValue, phone });
      } else if (role === "COMPANY") {
        await registerCompany({
          email,
          password: regPassword,
          companyName,
          city,
          district: districtValue,
          sector: sector || undefined,
          phone,
        });
      } else if (role === "SUPPLIER") {
        await registerSupplier({
          email,
          password: regPassword,
          companyName,
          city,
          district: districtValue,
          supplyCategories: supplyCategories.length > 0 ? supplyCategories : undefined,
          phone,
        });
      } else {
        if (tradeCategories.length === 0) {
          setError("En az bir branş/meslek seçmelisin");
          setIsSubmitting(false);
          return;
        }
        await registerSubcontractor({
          email,
          password: regPassword,
          companyName,
          city,
          district: districtValue,
          tradeCategories,
          description: description || undefined,
          phone,
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
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-md border border-ink-700 p-1">
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={`rounded py-2 text-sm font-medium transition ${
            tab === "login" ? "bg-gold-500 text-ink-950" : "text-silver-400 hover:text-silver-200"
          }`}
        >
          {t("nav.login")}
        </button>
        <button
          type="button"
          onClick={() => switchTab("register")}
          className={`rounded py-2 text-sm font-medium transition ${
            tab === "register" ? "bg-gold-500 text-ink-950" : "text-silver-400 hover:text-silver-200"
          }`}
        >
          {t("nav.register")}
        </button>
      </div>

      {tab === "login" ? (
        <>
          <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.loginHeading")}</h1>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Field label="E-posta veya Telefon Numarası">
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Şifre">
              <PasswordInput required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </Field>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Beni Hatırla
              </label>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />
                Oturumumu Açık Tut
              </label>
            </div>
            <p className="text-xs text-silver-500">
              Oturumumu Açık Tut kapalıysa, tarayıcıyı kapattığında oturumun otomatik olarak sona erer.
            </p>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
            >
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm text-silver-500">
            <Link href="/forgot-password" className="text-gold-400 hover:underline">
              Şifremi Unuttum
            </Link>
            <span>
              Hesabın yok mu?{" "}
              <button type="button" onClick={() => switchTab("register")} className="text-gold-400 hover:underline">
                Kayıt ol
              </button>
            </span>
          </div>
        </>
      ) : (
        <>
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

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {role === "CANDIDATE" ? (
              <Field label="Ad Soyad">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
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
                <CompanyNameWarning name={companyName} />
                <Field label="Sektör (opsiyonel)">
                  <input value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Firma Adı">
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <CompanyNameWarning name={companyName} />
              </>
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

            <ProvinceDistrictSelect
              city={city}
              district={district}
              onCityChange={setCity}
              onDistrictChange={setDistrict}
            />

            <Field label="E-posta">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Telefon Numarası">
              <input
                type="tel"
                required
                placeholder="05XX XXX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
            <p className="text-xs text-silver-500">
              Telefon numarası, piyasa endeksine girilen verilerin doğruluğunu korumak için isteniyor — doğrulama
              kodu gerekmez, sadece bu numarayla ikinci bir hesap açılamaz.
            </p>
            <Field label="Şifre (en az 8 karakter)">
              <PasswordInput required minLength={8} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
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
            <button type="button" onClick={() => switchTab("login")} className="text-gold-400 hover:underline">
              Giriş yap
            </button>
          </p>
        </>
      )}
    </div>
  );
}
