"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreateWageSubmissionInput,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
  PRICE_SUBMISSION_TYPES,
  PriceSubmissionType,
  TRADE_FIELDS,
  TURKISH_PROVINCES,
  WAGE_PERIODS,
  WagePeriod,
  WageIndexPoint,
} from "@bau360/shared";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Field, inputClass, selectClass } from "@/components/form";
import { IndexChart } from "@/components/index-chart";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { useLocale } from "@/lib/i18n/locale-context";

export default function WageIndexPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const [tradeCategory, setTradeCategory] = useState(TRADE_FIELDS[0].branches[0].professions[0].value);
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");

  const params = new URLSearchParams({ tradeCategory, city });
  if (district) params.set("district", district);

  const { data, isLoading } = useQuery({
    queryKey: ["wage-index", tradeCategory, city, district],
    queryFn: () => authFetch<WageIndexPoint[]>(`/wage-index?${params.toString()}`),
    enabled: !!user,
  });

  const [form, setForm] = useState<CreateWageSubmissionInput>({
    tradeCategory: TRADE_FIELDS[0].branches[0].professions[0].value,
    city: TURKISH_PROVINCES[0],
    district: "",
    experienceLevel: "MID",
    amount: 0,
    period: "DAILY",
    submissionType: "ACTUAL",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await authFetch("/wage-index", {
        method: "POST",
        body: JSON.stringify({ ...form, district: form.district || undefined }),
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gönderilemedi");
      setStatus("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-semibold text-silver-300">{t("pages.wageIndexHeading")}</h1>
        <div className="mb-4">
          <TradeCategorySelect value={tradeCategory} onChange={setTradeCategory} />
          <ProvinceDistrictSelect
            city={city}
            district={district}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
            allowEmptyDistrict
          />
          <p className="mt-1 text-xs text-silver-500">
            İlçe seçmezsen ilin tamamının ortalaması, seçersen sadece o ilçenin ortalaması gösterilir.
          </p>
        </div>
        {authLoading && <p className="text-silver-500">Yükleniyor...</p>}
        {!authLoading && !user && (
          <p className="text-sm text-silver-500">
            Ücret endeksini görüntülemek için giriş yapmalısın. İş arayan personel için üyelik tamamen ücretsizdir.
          </p>
        )}
        {user && isLoading && <p className="text-silver-500">Yükleniyor...</p>}
        {user && !isLoading && <IndexChart data={data ?? []} unitLabel="₺" />}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-silver-300">Yevmiye/Maaş Bilgisi Paylaş</h2>
        {authLoading && <p className="text-silver-500">Yükleniyor...</p>}
        {!authLoading && !user && <p className="text-sm text-silver-500">Veri paylaşmak için giriş yapmalısın.</p>}
        {user && (
          <>
            <p className="mb-4 rounded-md border border-gold-500/30 bg-ink-800 p-3 text-xs text-silver-400">
              Lütfen gerçek ve güncel bilgi paylaş. Yanlış ya da uydurma veri, herkesin gördüğü ücret endeksinin
              güvenilirliğini bozar.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
            <TradeCategorySelect
              value={form.tradeCategory}
              onChange={(v) => setForm({ ...form, tradeCategory: v })}
            />
            <ProvinceDistrictSelect
              city={form.city}
              district={form.district ?? ""}
              onCityChange={(v) => setForm({ ...form, city: v })}
              onDistrictChange={(v) => setForm({ ...form, district: v })}
              allowEmptyDistrict
            />
            <Field label="Deneyim">
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value as ExperienceLevel })}
                className={selectClass}
              >
                {EXPERIENCE_LEVELS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Periyot">
              <select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value as WagePeriod })}
                className={selectClass}
              >
                {WAGE_PERIODS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tutar (₺)">
              <input
                type="number"
                min={1}
                required
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Bu bilgi neyi yansıtıyor?">
              <select
                value={form.submissionType}
                onChange={(e) => setForm({ ...form, submissionType: e.target.value as PriceSubmissionType })}
                className={selectClass}
              >
                {PRICE_SUBMISSION_TYPES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="-mt-2 text-xs text-silver-500">
              Endeksin ana rakamı sadece gerçekleşen ödemelerden hesaplanır. Teklif/beklenti verisi ayrı bir
              &quot;piyasa beklentisi&quot; çizgisi olarak gösterilir.
            </p>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {status === "done" && <p className="text-sm text-green-400">Teşekkürler, katkın kaydedildi!</p>}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
            >
              {status === "submitting" ? "Gönderiliyor..." : "Paylaş"}
            </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}