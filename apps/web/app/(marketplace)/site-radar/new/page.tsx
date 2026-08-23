"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreateSiteRequestInput,
  EQUIPMENT_CATEGORIES,
  SITE_REQUEST_TYPES,
  SiteRequestType,
  TRADE_FIELDS,
  TURKISH_PROVINCES,
} from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { SiteMap } from "@/components/site-map";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { EquipmentCategorySelect } from "@/components/equipment-category-select";

export default function NewSiteRequestPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const [form, setForm] = useState<CreateSiteRequestInput>({
    requestType: "WORKER",
    tradeCategory: TRADE_FIELDS[0].branches[0].professions[0].value,
    equipmentType: EQUIPMENT_CATEGORIES[0].items[0].value,
    title: "",
    description: "",
    city: TURKISH_PROVINCES[0],
    district: "",
    latitude: 0,
    longitude: 0,
    neededCount: 1,
  });
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!location) {
      setError(t("siteRadar.new.locationRequired"));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/site-requests", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          district: form.district || undefined,
          latitude: location[0],
          longitude: location[1],
        }),
      });
      router.push("/site-radar/mine");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("siteRadar.new.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) return <p className="text-silver-500">{t("common.loading")}</p>;
  if (!user) return <p className="text-silver-500">{t("siteRadar.new.loginRequired")}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("siteRadar.new.heading")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t("siteRadar.new.requestTypeLabel")}>
          <div className="grid grid-cols-2 gap-2">
            {SITE_REQUEST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, requestType: t.value as SiteRequestType })}
                className={`rounded-md py-2 text-sm font-medium ${
                  form.requestType === t.value ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {form.requestType === "WORKER" ? (
          <TradeCategorySelect
            value={form.tradeCategory ?? ""}
            onChange={(v) => setForm({ ...form, tradeCategory: v })}
          />
        ) : (
          <EquipmentCategorySelect
            value={form.equipmentType ?? ""}
            onChange={(v) => setForm({ ...form, equipmentType: v })}
          />
        )}

        <Field label={t("siteRadar.new.titleLabel")}>
          <input
            required
            placeholder={t("siteRadar.new.titlePlaceholder")}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </Field>

        <ProvinceDistrictSelect
          city={form.city}
          district={form.district ?? ""}
          onCityChange={(v) => setForm({ ...form, city: v })}
          onDistrictChange={(v) => setForm({ ...form, district: v })}
          allowEmptyDistrict
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("siteRadar.new.neededCountLabel")}>
            <input
              type="number"
              min={1}
              value={form.neededCount}
              onChange={(e) => setForm({ ...form, neededCount: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
          <Field label={t("siteRadar.new.deadlineLabel")}>
            <input
              type="datetime-local"
              onChange={(e) => setForm({ ...form, neededBy: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={t("siteRadar.new.descriptionLabel")}>
          <textarea
            required
            minLength={10}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label={t("siteRadar.new.locationLabel")}>
          <SiteMap
            markers={[]}
            pickedLocation={location}
            onMapClick={(lat, lng) => setLocation([lat, lng])}
            height="18rem"
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? t("siteRadar.new.publishing") : t("siteRadar.new.publish")}
        </button>
      </form>
    </div>
  );
}
