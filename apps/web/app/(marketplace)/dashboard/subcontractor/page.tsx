"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SubcontractorProfileDto, TRADE_FIELDS, TURKISH_PROVINCES } from "@bau360/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategoryMultiSelect } from "@/components/trade-category-multi-select";
import { VerificationStatusCard } from "@/components/verification-status-card";

function ProfileEditor() {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-subcontractor-profile"],
    queryFn: () => authFetch<SubcontractorProfileDto>("/users/me/profile"),
  });

  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [tradeCategories, setTradeCategories] = useState<string[]>([
    TRADE_FIELDS[0].branches[0].professions[0].value,
  ]);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setCity(profile.city);
    setDistrict(profile.district ?? "");
    setTradeCategories(profile.tradeCategories);
    setDescription(profile.description ?? "");
    setIsPublic(profile.isPublic);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (tradeCategories.length === 0) {
      setError(t("dashboard.subcontractor.minCategoryError"));
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      await authFetch("/users/me/profile/subcontractor", {
        method: "PATCH",
        body: JSON.stringify({
          companyName,
          city,
          district: district || undefined,
          tradeCategories,
          description,
          isPublic,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["my-subcontractor-profile"] });
      setStatus("saved");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.form.saveFailed"));
      setStatus("error");
    }
  }

  if (isLoading) return <p className="text-silver-500">{t("common.loading")}</p>;

  return (
    <div className="space-y-6">
      {profile && (
        <VerificationStatusCard
          phoneVerified={!!profile.phoneVerifiedAt}
          membershipStatus={profile.membershipStatus}
          membershipExpiresAt={profile.membershipExpiresAt}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={t("dashboard.subcontractor.companyNameLabel")}>
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
      </Field>
      <TradeCategoryMultiSelect values={tradeCategories} onChange={setTradeCategories} />
      <ProvinceDistrictSelect
        city={city}
        district={district}
        onCityChange={setCity}
        onDistrictChange={setDistrict}
        allowEmptyDistrict
      />
      <Field label={t("dashboard.subcontractor.descriptionLabel")}>
        <textarea
          rows={4}
          placeholder={t("dashboard.subcontractor.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-silver-300">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        {t("dashboard.subcontractor.publicLabel")}
      </label>
      <p className="text-xs text-silver-500">{t("dashboard.subcontractor.publicHint")}</p>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {status === "saved" && <p className="text-sm text-green-400">{t("dashboard.form.saved")}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "saving" ? t("dashboard.form.saving") : t("dashboard.form.save")}
      </button>
      </form>
    </div>
  );
}

export default function SubcontractorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLocale();

  if (authLoading) return <p className="text-silver-500">{t("common.loading")}</p>;
  if (user?.role !== "SUBCONTRACTOR") {
    return <p className="text-silver-500">{t("dashboard.subcontractor.roleGuard")}</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-silver-300">{t("dashboard.subcontractor.profileHeading")}</h1>
        <Link href="/membership" className="text-sm text-gold-400 hover:underline">
          {t("dashboard.subcontractor.membershipStatusLink")}
        </Link>
      </div>
      <p className="mb-4 text-xs text-silver-500">{t("dashboard.subcontractor.membershipHint")}</p>
      <ProfileEditor />
    </div>
  );
}