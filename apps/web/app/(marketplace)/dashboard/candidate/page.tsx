"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ApplicationDto,
  AvailabilityStatus,
  CandidateProfileDto,
  TRADE_FIELDS,
  TURKISH_PROVINCES,
  WORK_PREFERENCES,
} from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { WageScaleCard } from "@/components/wage-scale-card";
import { CandidatePhotoUploader } from "@/components/candidate-photo-uploader";
import { FormSkeleton } from "@/components/form-skeleton";
import { ListSkeleton } from "@/components/list-skeleton";

function ProfileEditor() {
  const { authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-candidate-profile"],
    queryFn: () => authFetch<CandidateProfileDto & { role: string }>("/users/me/profile"),
  });

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [primaryTradeCategory, setPrimaryTradeCategory] = useState(
    TRADE_FIELDS[0].branches[0].professions[0].value,
  );
  const [phone, setPhone] = useState("");
  const [workPreferences, setWorkPreferences] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("AVAILABLE");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setCity(profile.city);
    setDistrict(profile.district ?? "");
    setExperienceYears(profile.experienceYears);
    setPrimaryTradeCategory(profile.primaryTradeCategory ?? TRADE_FIELDS[0].branches[0].professions[0].value);
    setPhone(profile.phone ?? "");
    setWorkPreferences(profile.workPreferences);
    setIsPublic(profile.isPublic);
    setPhotoVisible(profile.photoVisible);
    setAvailabilityStatus(profile.availabilityStatus);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      await authFetch("/users/me/profile/candidate", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          city,
          district: district || undefined,
          experienceYears,
          primaryTradeCategory,
          phone,
          workPreferences,
          isPublic,
          photoVisible,
          availabilityStatus,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["my-candidate-profile"] });
      setStatus("saved");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.form.saveFailed"));
      setStatus("error");
    }
  }

  if (isLoading) return <FormSkeleton rows={5} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CandidatePhotoUploader photoUrl={profile?.photoUrl} />
      <Field label={t("dashboard.candidate.fullNameLabel")}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </Field>
      <TradeCategorySelect value={primaryTradeCategory} onChange={setPrimaryTradeCategory} />
      <ProvinceDistrictSelect
        city={city}
        district={district}
        onCityChange={setCity}
        onDistrictChange={setDistrict}
        allowEmptyDistrict
      />
      <Field label={t("dashboard.candidate.experienceLabel")}>
        <input
          type="number"
          min={0}
          value={experienceYears}
          onChange={(e) => setExperienceYears(Number(e.target.value))}
          className={inputClass}
        />
      </Field>
      <Field label={t("dashboard.candidate.phoneLabel")}>
        <input
          placeholder="+905551234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div>
        <p className="mb-2 text-sm text-silver-300">{t("dashboard.candidate.workPreferencesLabel")}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {WORK_PREFERENCES.map((w) => (
            <label key={w.value} className="flex items-center gap-2 text-sm text-silver-400">
              <input
                type="checkbox"
                checked={workPreferences.includes(w.value)}
                onChange={(e) =>
                  setWorkPreferences(
                    e.target.checked
                      ? [...workPreferences, w.value]
                      : workPreferences.filter((v) => v !== w.value),
                  )
                }
              />
              {w.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-silver-300">{t("dashboard.candidate.availabilityLabel")}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAvailabilityStatus("AVAILABLE")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
              availabilityStatus === "AVAILABLE"
                ? "bg-green-600 text-white"
                : "border border-ink-700 text-silver-400 hover:border-green-500"
            }`}
          >
            {t("dashboard.candidate.availableButton")}
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityStatus("BUSY")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
              availabilityStatus === "BUSY"
                ? "bg-ink-700 text-silver-200"
                : "border border-ink-700 text-silver-400 hover:border-gold-500"
            }`}
          >
            {t("dashboard.candidate.busyButton")}
          </button>
        </div>
        <p className="mt-1 text-xs text-silver-500">{t("dashboard.candidate.busyHint")}</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-silver-300">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        {t("dashboard.candidate.publicLabel")}
      </label>
      <p className="text-xs text-silver-500">{t("dashboard.candidate.publicHint")}</p>

      <label className="flex items-center gap-2 text-sm text-silver-300">
        <input type="checkbox" checked={photoVisible} onChange={(e) => setPhotoVisible(e.target.checked)} />
        {t("dashboard.candidate.photoVisibleLabel")}
      </label>
      <p className="text-xs text-silver-500">{t("dashboard.candidate.photoVisibleHint")}</p>

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
  );
}

export default function CandidateDashboardPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => authFetch<ApplicationDto[]>("/applications/mine"),
    enabled: user?.role === "CANDIDATE",
  });

  const { data: profile } = useQuery({
    queryKey: ["my-candidate-profile"],
    queryFn: () => authFetch<CandidateProfileDto & { role: string }>("/users/me/profile"),
    enabled: user?.role === "CANDIDATE",
  });

  if (authLoading) return <FormSkeleton rows={5} />;
  if (user?.role !== "CANDIDATE")
    return <p className="text-silver-500">{t("dashboard.candidate.roleGuard")}</p>;

  return (
    <div className="space-y-10">
      {profile?.primaryTradeCategory && profile.city && (
        <WageScaleCard
          tradeCategory={profile.primaryTradeCategory}
          city={profile.city}
          district={profile.district}
        />
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("dashboard.candidate.applicationsHeading")}</h1>
          {isLoading && <ListSkeleton count={3} />}
          {applications?.length === 0 && (
            <p className="text-silver-500">
              {t("dashboard.candidate.noApplications")}{" "}
              <Link href="/jobs" className="text-gold-400 hover:underline">
                {t("dashboard.candidate.browseJobsLink")}
              </Link>
            </p>
          )}

          <div className="space-y-3">
            {applications?.map((app) => (
              <Link
                key={app.id}
                href={`/jobs/${app.jobId}`}
                className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
              >
                <p className="font-medium text-silver-200">{app.jobTitle}</p>
                <span className="text-sm text-silver-500">{t(`dashboard.applicationStatus.${app.status}`)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-silver-300">{t("dashboard.candidate.profileHeading")}</h2>
          <ProfileEditor />
        </section>
      </div>
    </div>
  );
}