"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
  WAGE_SUBJECT_TYPES,
  WagePeriod,
  WageIndexPoint,
  WageSubjectType,
} from "@imeceburada/shared";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Field, inputClass, selectClass } from "@/components/form";
import { IndexChart } from "@/components/index-chart";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { EquipmentCategorySelect } from "@/components/equipment-category-select";
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

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile-phone"],
    queryFn: () => authFetch<{ phone?: string | null }>("/users/me/profile"),
    enabled: !!user,
  });
  const needsPhone = !!user && myProfile !== undefined && !myProfile?.phone;

  const [form, setForm] = useState<CreateWageSubmissionInput>({
    subjectType: "INDIVIDUAL",
    tradeCategory: TRADE_FIELDS[0].branches[0].professions[0].value,
    city: TURKISH_PROVINCES[0],
    district: "",
    experienceLevel: "MID",
    equipmentType: "",
    teamSize: undefined,
    amount: 0,
    period: "DAILY",
    submissionType: "ACTUAL",
    phone: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        subjectType: form.subjectType,
        city: form.city,
        district: form.district || undefined,
        amount: form.amount,
        period: form.period,
        submissionType: form.submissionType,
        phone: needsPhone ? form.phone || undefined : undefined,
      };
      if (form.subjectType === "EQUIPMENT") {
        payload.equipmentType = form.equipmentType;
      } else {
        payload.tradeCategory = form.tradeCategory;
        if (form.subjectType === "TEAM") payload.teamSize = form.teamSize;
        if (form.subjectType === "INDIVIDUAL") payload.experienceLevel = form.experienceLevel;
      }
      await authFetch("/wage-index", { method: "POST", body: JSON.stringify(payload) });
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
            Ücret endeksini görüntülemek için{" "}
            <Link href="/login" className="text-gold-400 hover:underline">
              giriş yapmalısın
            </Link>
            . İş arayan personel için üyelik tamamen ücretsizdir.
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
            <Field label="Kimin için?">
              <select
                value={form.subjectType}
                onChange={(e) => setForm({ ...form, subjectType: e.target.value as WageSubjectType })}
                className={selectClass}
              >
                {WAGE_SUBJECT_TYPES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>
            {form.subjectType === "EQUIPMENT" ? (
              <EquipmentCategorySelect
                value={form.equipmentType ?? ""}
                onChange={(v) => setForm({ ...form, equipmentType: v })}
              />
            ) : (
              <TradeCategorySelect
                value={form.tradeCategory ?? ""}
                onChange={(v) => setForm({ ...form, tradeCategory: v })}
              />
            )}
            <ProvinceDistrictSelect
              city={form.city}
              district={form.district ?? ""}
              onCityChange={(v) => setForm((prev) => ({ ...prev, city: v }))}
              onDistrictChange={(v) => setForm((prev) => ({ ...prev, district: v }))}
              allowEmptyDistrict
            />
            {form.subjectType === "INDIVIDUAL" && (
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
            )}
            {form.subjectType === "TEAM" && (
              <Field label="Ekip Büyüklüğü (kişi sayısı)">
                <input
                  type="number"
                  min={2}
                  required
                  value={form.teamSize ?? ""}
                  onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
            )}
            {needsPhone && (
              <Field label="Telefon Numarası (+90...)">
                <input
                  type="tel"
                  required
                  placeholder="+905551234567"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </Field>
            )}
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