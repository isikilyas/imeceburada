"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CandidateDirectoryEntryDto, EXCAVATION_MACHINE_TYPES, PaginatedResult, TRADE_CATEGORIES } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { Avatar } from "@/components/avatar";
import { Field, inputClass, selectClass } from "@/components/form";
import { ListSkeleton } from "@/components/list-skeleton";
import { LoginModal } from "@/components/login-modal";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CandidateDirectoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [tradeCategory, setTradeCategory] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [machineSpecialty, setMachineSpecialty] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skill, setSkill] = useState("");
  const [pendingCandidateId, setPendingCandidateId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setSkill(skillInput.trim()), 400);
    return () => clearTimeout(id);
  }, [skillInput]);

  const params = new URLSearchParams();
  if (tradeCategory) params.set("tradeCategory", tradeCategory);
  if (city) params.set("city", city);
  if (district) params.set("district", district);
  if (tradeCategory === "HAFRIYAT_OPERATORU" && machineSpecialty) params.set("machineSpecialty", machineSpecialty);
  if (skill) params.set("skill", skill);

  const { data, isLoading, error } = useQuery({
    queryKey: ["candidates", tradeCategory, city, district, machineSpecialty, skill],
    queryFn: () => apiFetch<PaginatedResult<CandidateDirectoryEntryDto>>(`/candidates?${params.toString()}`),
  });

  if (authLoading) return <ListSkeleton count={4} columns={2} />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("pages.candidatesHeading")}</h1>

      <div className="mb-6 space-y-3">
        <TradeCategorySelect value={tradeCategory} onChange={setTradeCategory} allowEmpty />
        {tradeCategory === "HAFRIYAT_OPERATORU" && (
          <Field label={t("pages.machineSpecialtyFilterLabel")}>
            <select value={machineSpecialty} onChange={(e) => setMachineSpecialty(e.target.value)} className={selectClass}>
              <option value="">{t("filters.allMachineSpecialties")}</option>
              {EXCAVATION_MACHINE_TYPES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        <ProvinceDistrictSelect
          city={city}
          district={district}
          onCityChange={setCity}
          onDistrictChange={setDistrict}
          allowEmptyCity
          allowEmptyDistrict
        />
        <Field label={t("pages.skillFilterLabel")}>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder={t("pages.skillFilterPlaceholder")}
            className={inputClass}
          />
        </Field>
      </div>

      {isLoading && <ListSkeleton count={4} columns={2} />}
      {error && (
        <p className="text-sm text-red-400">
          {(error as Error).message ?? t("common.membershipRequiredError")}
        </p>
      )}
      {!isLoading && data?.items.length === 0 && <p className="text-silver-500">{t("common.noResults")}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.items.map((c) => (
          <Link
            key={c.id}
            href={`/candidates/${c.id}`}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                setPendingCandidateId(c.id);
              }
            }}
            className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar photoUrl={c.photoUrl} size={40} />
                <p className="font-medium text-silver-200">{c.fullName}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  c.availabilityStatus === "AVAILABLE"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-ink-800 text-silver-500"
                }`}
              >
                {c.availabilityStatus === "AVAILABLE"
                  ? `🟢 ${t("enums.availabilityStatus.AVAILABLE")}`
                  : `🔴 ${t("enums.availabilityStatus.BUSY")}`}
              </span>
            </div>
            <p className="text-sm text-silver-500">
              {c.city}
              {c.district ? ` / ${c.district}` : ""} ·{" "}
              {t("pages.candidatesExperienceYears", { count: c.experienceYears })}
            </p>
            <p className="mt-2 text-xs text-gold-400">
              {TRADE_CATEGORIES.find((t) => t.value === c.primaryTradeCategory)?.label ?? c.primaryTradeCategory}
            </p>
            {c.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.skills.map((s) => (
                  <span key={s} className="rounded-full border border-ink-700 px-2 py-0.5 text-[11px] text-silver-400">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {c.workPreferences.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.workPreferences.map((v) => (
                  <span key={v} className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-silver-400">
                    {t(`enums.workPreference.${v}`)}
                  </span>
                ))}
              </div>
            )}
            {c.machineSpecialties.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.machineSpecialties.map((v) => (
                  <span key={v} className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-400">
                    {EXCAVATION_MACHINE_TYPES.find((m) => m.value === v)?.label ?? v}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      <LoginModal
        open={pendingCandidateId !== null}
        onClose={() => setPendingCandidateId(null)}
        onSuccess={() => {
          if (pendingCandidateId) router.push(`/candidates/${pendingCandidateId}`);
        }}
      />
    </div>
  );
}