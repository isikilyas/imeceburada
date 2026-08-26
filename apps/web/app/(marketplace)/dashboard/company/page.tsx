"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CompanyProfileDto,
  CreateJobInput,
  EMPLOYMENT_TYPES,
  EmploymentType,
  JobPostingDto,
  LISTING_INTENTS,
  ListingIntent,
  TRADE_FIELDS,
  TURKISH_PROVINCES,
} from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass, selectClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { VerificationStatusCard } from "@/components/verification-status-card";
import { BetaBanner } from "@/components/beta-banner";
import { FormSkeleton } from "@/components/form-skeleton";

function ProfileEditor() {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-company-profile"],
    queryFn: () => authFetch<CompanyProfileDto>("/users/me/profile"),
  });

  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setSector(profile.sector ?? "");
    setCity(profile.city);
    setDistrict(profile.district ?? "");
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      await authFetch("/users/me/profile/company", {
        method: "PATCH",
        body: JSON.stringify({ companyName, sector: sector || undefined, city, district: district || undefined }),
      });
      queryClient.invalidateQueries({ queryKey: ["my-company-profile"] });
      setStatus("saved");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.form.saveFailed"));
      setStatus("error");
    }
  }

  if (isLoading) return <FormSkeleton rows={5} />;

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
        <Field label={t("dashboard.company.companyNameLabel")}>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
        </Field>
        <Field label={t("dashboard.company.sectorLabel")}>
          <input value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass} />
        </Field>
        <ProvinceDistrictSelect
          city={city}
          district={district}
          onCityChange={setCity}
          onDistrictChange={setDistrict}
          allowEmptyDistrict
        />
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

export default function CompanyDashboardPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const { data: jobs } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => authFetch<JobPostingDto[]>("/jobs/mine"),
    enabled: user?.role === "COMPANY",
  });

  const [form, setForm] = useState<CreateJobInput>({
    title: "",
    listingType: "PERSONNEL",
    tradeCategory: TRADE_FIELDS[0].branches[0].professions[0].value,
    city: TURKISH_PROVINCES[0],
    district: "",
    employmentType: "DAILY",
    isUrgent: false,
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({ ...form, district: form.district || undefined }),
      });
      setForm({ ...form, title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.form.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose(jobId: string) {
    await authFetch(`/jobs/${jobId}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
  }

  if (authLoading) return <FormSkeleton rows={5} />;
  if (user?.role !== "COMPANY") return <p className="text-silver-500">{t("dashboard.company.roleGuard")}</p>;

  return (
    <div className="space-y-10">
      <BetaBanner />
      <section>
        <h1 className="mb-4 text-2xl font-semibold text-silver-300">{t("dashboard.company.profileHeading")}</h1>
        <ProfileEditor />
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <section>
        <h2 className="mb-4 text-xl font-semibold text-silver-300">{t("common.myListings")}</h2>
        <div className="space-y-3">
          {jobs?.length === 0 && <p className="text-silver-500">{t("dashboard.company.noJobs")}</p>}
          {jobs?.map((job) => (
            <div key={job.id} className="rounded-lg border border-ink-800 bg-ink-900 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-silver-200">{job.title}</p>
                  <p className="text-xs text-silver-500">
                    {job.city}
                    {job.district ? ` / ${job.district}` : ""} ·{" "}
                    {job.status === "ACTIVE" ? t("dashboard.company.statusActive") : t("dashboard.company.statusClosed")}
                  </p>
                  <p className="mt-1 text-xs text-gold-400">
                    {LISTING_INTENTS.find((l) => l.value === job.listingType)?.label ?? job.listingType}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <Link href={`/dashboard/company/jobs/${job.id}`} className="text-gold-400 hover:underline">
                    {t("dashboard.company.applicationsLink")}
                  </Link>
                  {job.status === "ACTIVE" && (
                    <button onClick={() => handleClose(job.id)} className="text-silver-500 hover:text-red-400">
                      {t("dashboard.company.closeButton")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-silver-300">{t("dashboard.company.newJobHeading")}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label={t("dashboard.company.titleLabel")}>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={t("dashboard.company.listingTypeLabel")}>
            <select
              value={form.listingType}
              onChange={(e) => setForm({ ...form, listingType: e.target.value as ListingIntent })}
              className={selectClass}
            >
              {LISTING_INTENTS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
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
          <Field label={t("filters.employmentType")}>
            <select
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentType })}
              className={selectClass}
            >
              {EMPLOYMENT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("dashboard.company.minSalaryLabel")}>
              <input
                type="number"
                min={0}
                value={form.salaryMin ?? ""}
                onChange={(e) => setForm({ ...form, salaryMin: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClass}
              />
            </Field>
            <Field label={t("dashboard.company.maxSalaryLabel")}>
              <input
                type="number"
                min={0}
                value={form.salaryMax ?? ""}
                onChange={(e) => setForm({ ...form, salaryMax: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClass}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input
              type="checkbox"
              checked={form.isUrgent ?? false}
              onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
            />
            {t("dashboard.company.urgentLabel")}
          </label>
          <Field label={t("dashboard.company.descriptionLabel")}>
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
