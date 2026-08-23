"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateEquipmentListingInput, EQUIPMENT_CATEGORIES, EQUIPMENT_LISTING_TYPES, TURKISH_PROVINCES } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { EquipmentCategorySelect } from "@/components/equipment-category-select";
import { EquipmentCapacitySelect } from "@/components/equipment-capacity-select";
import { useLocale } from "@/lib/i18n/locale-context";

export default function NewEquipmentPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [form, setForm] = useState<CreateEquipmentListingInput>({
    equipmentType: EQUIPMENT_CATEGORIES[0].items[0].value,
    capacity: "",
    city: TURKISH_PROVINCES[0],
    district: "",
    listingType: "RENT",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/equipment", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          district: form.district || undefined,
          capacity: form.capacity || undefined,
          dailyRate: form.listingType === "SALE" ? undefined : form.dailyRate,
          hourlyRate: form.listingType === "SALE" ? undefined : form.hourlyRate,
          salePrice: form.listingType === "SALE" ? form.salePrice : undefined,
        }),
      });
      router.push("/equipment/mine");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("listingDetail.equipment.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) return <p className="text-silver-500">{t("common.loading")}</p>;
  if (!user) return <p className="text-silver-500">{t("listingDetail.equipment.mustLoginToPost")}</p>;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("listingDetail.equipment.newEquipmentHeading")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <EquipmentCategorySelect
          value={form.equipmentType}
          onChange={(v) => setForm({ ...form, equipmentType: v, capacity: "" })}
        />
        <EquipmentCapacitySelect
          equipmentType={form.equipmentType}
          value={form.capacity ?? ""}
          onChange={(v) => setForm({ ...form, capacity: v })}
        />
        <ProvinceDistrictSelect
          city={form.city}
          district={form.district ?? ""}
          onCityChange={(v) => setForm({ ...form, city: v })}
          onDistrictChange={(v) => setForm({ ...form, district: v })}
          allowEmptyDistrict
        />
        <Field label={t("filters.listingType")}>
          <div className="flex gap-2">
            {EQUIPMENT_LISTING_TYPES.map((lt) => (
              <button
                key={lt.value}
                type="button"
                onClick={() => setForm({ ...form, listingType: lt.value })}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  form.listingType === lt.value
                    ? "border-gold-500 bg-gold-500/10 text-gold-400"
                    : "border-ink-700 text-silver-300 hover:border-ink-600"
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </Field>
        {form.listingType === "SALE" ? (
          <Field label={t("listingDetail.equipment.salePriceLabel")}>
            <input
              type="number"
              min={0}
              required
              value={form.salePrice ?? ""}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value ? Number(e.target.value) : undefined })}
              className={inputClass}
            />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("listingDetail.equipment.dailyRateLabel")}>
              <input
                type="number"
                min={0}
                value={form.dailyRate ?? ""}
                onChange={(e) => setForm({ ...form, dailyRate: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClass}
              />
            </Field>
            <Field label={t("listingDetail.equipment.hourlyRateLabel")}>
              <input
                type="number"
                min={0}
                value={form.hourlyRate ?? ""}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClass}
              />
            </Field>
          </div>
        )}
        <Field label={t("listingDetail.equipment.descriptionLabel")}>
          <textarea
            required
            minLength={10}
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? t("listingDetail.equipment.submitting") : t("listingDetail.equipment.publish")}
        </button>
      </form>
    </div>
  );
}
