"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateMaterialListingInput, MATERIAL_TYPES, MaterialListingDto, TURKISH_PROVINCES } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass, selectClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { CustomTermInput } from "@/components/custom-term-input";
import { ListingPhotoUploader } from "@/components/listing-photo-uploader";
import { BetaBanner } from "@/components/beta-banner";
import { FormSkeleton } from "@/components/form-skeleton";

export default function SupplierDashboardPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const { data: listings } = useQuery({
    queryKey: ["my-material-listings"],
    queryFn: () => authFetch<MaterialListingDto[]>("/material-listings/mine"),
    enabled: user?.role === "SUPPLIER",
  });

  const [form, setForm] = useState<CreateMaterialListingInput>({
    materialType: MATERIAL_TYPES[0].value,
    city: TURKISH_PROVINCES[0],
    district: "",
    price: 0,
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomMaterialType, setShowCustomMaterialType] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/material-listings", {
        method: "POST",
        body: JSON.stringify({ ...form, district: form.district || undefined }),
      });
      setForm({ ...form, price: 0, description: "" });
      queryClient.invalidateQueries({ queryKey: ["my-material-listings"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.form.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!window.confirm(t("dashboard.supplier.deactivateConfirm"))) return;
    await authFetch(`/material-listings/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["my-material-listings"] });
  }

  if (authLoading) return <FormSkeleton rows={5} />;
  if (user?.role !== "SUPPLIER")
    return <p className="text-silver-500">{t("dashboard.supplier.roleGuard")}</p>;

  return (
    <div className="space-y-10">
      <BetaBanner />
      <section>
        <h1 className="mb-4 text-2xl font-semibold text-silver-300">{t("dashboard.supplier.profileHeading")}</h1>
        <Link
          href="/account"
          className="block rounded-lg border border-ink-800 bg-ink-900 p-4 text-sm text-gold-400 hover:border-gold-500"
        >
          {t("accountPanel.goToAccountLink")}
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-silver-300">{t("common.myListings")}</h2>
            <Link href="/membership" className="text-sm text-gold-400 hover:underline">
              {t("dashboard.supplier.membershipStatusLink")}
            </Link>
          </div>
          <div className="space-y-3">
            {listings?.length === 0 && <p className="text-silver-500">{t("dashboard.supplier.noListings")}</p>}
            {listings?.map((listing) => (
              <div key={listing.id} className="rounded-lg border border-ink-800 bg-ink-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-silver-200">
                      {MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType}
                    </p>
                    <p className="text-xs text-silver-500">
                      {listing.city}
                      {listing.district ? ` / ${listing.district}` : ""} · {listing.price} ₺/{listing.unit} ·{" "}
                      {listing.status === "AVAILABLE" ? t("dashboard.supplier.statusActive") : t("dashboard.supplier.statusInactive")}
                    </p>
                  </div>
                  {listing.status === "AVAILABLE" && (
                    <button
                      onClick={() => handleDeactivate(listing.id)}
                      className="text-sm text-silver-500 hover:text-red-400"
                    >
                      {t("dashboard.supplier.deactivateButton")}
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <ListingPhotoUploader
                    endpoint={`/material-listings/${listing.id}/photo`}
                    photoUrl={listing.photoUrl}
                    invalidateKey={["my-material-listings"]}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-silver-300">{t("dashboard.supplier.newListingHeading")}</h2>
          <p className="mb-4 text-xs text-silver-500">{t("dashboard.supplier.publishHint")}</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label={t("filters.material")}>
              <select
                value={form.materialType}
                onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                className={selectClass}
              >
                {MATERIAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.unit})
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <button
                type="button"
                onClick={() => setShowCustomMaterialType((s) => !s)}
                className="text-xs text-silver-500 hover:text-gold-400"
              >
                {showCustomMaterialType ? "Listeden seç" : "Listede yok mu? Kendi terimini yaz"}
              </button>
              {showCustomMaterialType && (
                <div className="mt-2">
                  <CustomTermInput
                    type="MATERIAL_TYPE"
                    onAdd={(v) => {
                      setForm({ ...form, materialType: v });
                      setShowCustomMaterialType(false);
                    }}
                  />
                </div>
              )}
            </div>
            <ProvinceDistrictSelect
              city={form.city}
              district={form.district ?? ""}
              onCityChange={(v) => setForm((prev) => ({ ...prev, city: v }))}
              onDistrictChange={(v) => setForm((prev) => ({ ...prev, district: v }))}
              allowEmptyDistrict
            />
            <Field label={t("dashboard.supplier.unitPriceLabel")}>
              <input
                type="number"
                min={1}
                required
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label={t("dashboard.supplier.descriptionLabel")}>
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
              {isSubmitting ? t("dashboard.form.creating") : t("dashboard.form.publish")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}