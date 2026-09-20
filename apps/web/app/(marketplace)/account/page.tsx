"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  AvailabilityStatus,
  CandidateProfileDto,
  CompanyProfileDto,
  EXCAVATION_MACHINE_TYPES,
  SubcontractorProfileDto,
  SupplierProfileDto,
  TRADE_FIELDS,
  TURKISH_PROVINCES,
  WORK_PREFERENCES,
} from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { useProfileSave } from "@/lib/use-profile-save";
import { Field, inputClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { TradeCategoryMultiSelect } from "@/components/trade-category-multi-select";
import { MaterialCategoryMultiSelect } from "@/components/material-category-multi-select";
import { CandidatePhotoUploader } from "@/components/candidate-photo-uploader";
import { CompanyLogoUploader } from "@/components/company-logo-uploader";
import { AdminPhotoUploader } from "@/components/admin-photo-uploader";
import { CompanyNameWarning } from "@/components/company-name-warning";
import { VerificationStatusCard } from "@/components/verification-status-card";
import { DeleteAccountSection } from "@/components/delete-account-section";
import { DeactivateAccountSection } from "@/components/deactivate-account-section";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { LogoutAllDevicesButton } from "@/components/logout-all-devices-button";
import { UsernameField } from "@/components/username-field";
import { AccountInfoCard } from "@/components/account-info-card";
import { AddressBook } from "@/components/address-book";
import { MembershipHistoryList } from "@/components/membership-history-list";
import { TabNav } from "@/components/tab-nav";
import { FormSkeleton } from "@/components/form-skeleton";

type Tab = "profile" | "corporate" | "addresses" | "privacy" | "notifications" | "security" | "membership" | "activity";

const cardClass = "rounded-2xl border border-ink-800 bg-ink-900/60 p-5 sm:p-6";

interface AccountFields {
  role: string;
  email: string;
  username?: string | null;
  accountCreatedAt: string;
  lastLoginAt?: string | null;
  pendingEmail?: string | null;
  title?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
}

function ActivityCard({ title, hint, href }: { title: string; hint: string; href: string }) {
  const { t } = useLocale();
  return (
    <Link
      href={href}
      className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
    >
      <p className="font-medium text-silver-200">{title}</p>
      <p className="mt-1 text-sm text-silver-500">{hint}</p>
      <p className="mt-2 text-sm text-gold-400">{t("accountPanel.activity.goLink")}</p>
    </Link>
  );
}

function CandidateAccountPanel() {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-candidate-profile"],
    queryFn: () => authFetch<CandidateProfileDto & AccountFields>(
      "/users/me/profile",
    ),
  });
  const { status, error, save } = useProfileSave("/users/me/profile/candidate", ["my-candidate-profile"]);
  const [tab, setTab] = useState<Tab>("profile");

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [primaryTradeCategory, setPrimaryTradeCategory] = useState(
    TRADE_FIELDS[0].branches[0].professions[0].value,
  );
  const [phone, setPhone] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [workPreferences, setWorkPreferences] = useState<string[]>([]);
  const [machineSpecialties, setMachineSpecialties] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("AVAILABLE");
  const [availableFrom, setAvailableFrom] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [hasProfessionalQualificationCert, setHasProfessionalQualificationCert] = useState(false);
  const [hasMasterCraftsmanCert, setHasMasterCraftsmanCert] = useState(false);
  const [hasOshCert, setHasOshCert] = useState(false);
  const [serviceRadiusKm, setServiceRadiusKm] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setCity(profile.city);
    setDistrict(profile.district ?? "");
    setAddress(profile.address ?? "");
    setBio(profile.bio ?? "");
    setExperienceYears(profile.experienceYears);
    setPrimaryTradeCategory(profile.primaryTradeCategory ?? TRADE_FIELDS[0].branches[0].professions[0].value);
    setPhone(profile.phone ?? "");
    setSkillsText(profile.skills.join(", "));
    setWorkPreferences(profile.workPreferences);
    setMachineSpecialties(profile.machineSpecialties);
    setIsPublic(profile.isPublic);
    setPhotoVisible(profile.photoVisible);
    setPhoneVisible(profile.phoneVisible);
    setAvailabilityStatus(profile.availabilityStatus);
    setAvailableFrom(profile.availableFrom ? profile.availableFrom.slice(0, 10) : "");
    setNotifyByEmail(profile.notifyByEmail);
    setHasProfessionalQualificationCert(profile.hasProfessionalQualificationCert);
    setHasMasterCraftsmanCert(profile.hasMasterCraftsmanCert);
    setHasOshCert(profile.hasOshCert);
    setServiceRadiusKm(profile.serviceRadiusKm != null ? String(profile.serviceRadiusKm) : "");
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await save({
      fullName,
      city,
      district: district || undefined,
      address: address || undefined,
      bio: bio || undefined,
      experienceYears,
      primaryTradeCategory,
      phone,
      skills,
      workPreferences,
      machineSpecialties: primaryTradeCategory === "HAFRIYAT_OPERATORU" ? machineSpecialties : [],
      isPublic,
      photoVisible,
      phoneVisible,
      availabilityStatus,
      availableFrom: availabilityStatus === "BUSY" && availableFrom ? availableFrom : undefined,
      notifyByEmail,
      hasProfessionalQualificationCert,
      hasMasterCraftsmanCert,
      hasOshCert,
      serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : undefined,
    });
  }

  if (isLoading || !profile) return <FormSkeleton rows={5} />;

  const tabs = [
    { id: "profile", label: t("accountPanel.tabs.profile") },
    { id: "addresses", label: t("accountPanel.tabs.addresses") },
    { id: "privacy", label: t("accountPanel.tabs.privacy") },
    { id: "notifications", label: t("accountPanel.tabs.notifications") },
    { id: "security", label: t("accountPanel.tabs.security") },
    { id: "activity", label: t("accountPanel.tabs.activity") },
  ];

  return (
    <div className="space-y-6">
      <AccountInfoCard
        email={profile.email}
        accountCreatedAt={profile.accountCreatedAt}
        lastLoginAt={profile.lastLoginAt}
        pendingEmail={profile.pendingEmail}
        isCorporate={false}
      />
      <TabNav tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {(tab === "profile" || tab === "privacy" || tab === "notifications") && (
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          {tab === "profile" && (
            <>
              <CandidatePhotoUploader photoUrl={profile.photoUrl} />
              <UsernameField value={profile.username} queryKey="my-candidate-profile" />
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
              <Field label={t("accountPanel.serviceRadiusLabel")}>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="50"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.serviceRadiusHint")}</p>
              <Field label={t("accountPanel.addressLabel")}>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.addressHint")}</p>
              <Field label={t("accountPanel.bioLabel")}>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={inputClass}
                />
              </Field>
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
              <Field label={t("accountPanel.skillsLabel")}>
                <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} className={inputClass} />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.skillsHint")}</p>

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

              {primaryTradeCategory === "HAFRIYAT_OPERATORU" && (
                <div>
                  <p className="mb-2 text-sm text-silver-300">{t("dashboard.candidate.machineSpecialtiesLabel")}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {EXCAVATION_MACHINE_TYPES.map((m) => (
                      <label key={m.value} className="flex items-center gap-2 text-sm text-silver-400">
                        <input
                          type="checkbox"
                          checked={machineSpecialties.includes(m.value)}
                          onChange={(e) =>
                            setMachineSpecialties(
                              e.target.checked
                                ? [...machineSpecialties, m.value]
                                : machineSpecialties.filter((v) => v !== m.value),
                            )
                          }
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

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
                {availabilityStatus === "BUSY" && (
                  <div className="mt-3">
                    <Field label={t("accountPanel.availableFromLabel")}>
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm text-silver-300">{t("accountPanel.certs.heading")}</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-silver-400">
                    <input
                      type="checkbox"
                      checked={hasProfessionalQualificationCert}
                      onChange={(e) => setHasProfessionalQualificationCert(e.target.checked)}
                    />
                    {t("accountPanel.certs.professionalQualification")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-silver-400">
                    <input
                      type="checkbox"
                      checked={hasMasterCraftsmanCert}
                      onChange={(e) => setHasMasterCraftsmanCert(e.target.checked)}
                    />
                    {t("accountPanel.certs.masterCraftsman")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-silver-400">
                    <input type="checkbox" checked={hasOshCert} onChange={(e) => setHasOshCert(e.target.checked)} />
                    {t("accountPanel.certs.osh")}
                  </label>
                </div>
                <p className="mt-1.5 text-xs text-silver-500">{t("accountPanel.certs.hint")}</p>
              </div>
            </>
          )}

          {tab === "privacy" && (
            <>
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

              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={phoneVisible} onChange={(e) => setPhoneVisible(e.target.checked)} />
                {t("dashboard.candidate.phoneVisibleLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("dashboard.candidate.phoneVisibleHint")}</p>
            </>
          )}

          {tab === "notifications" && (
            <>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input
                  type="checkbox"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                />
                {t("accountPanel.notifications.applicationStatusLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("accountPanel.notifications.applicationStatusHint")}</p>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === "saved" && <p className="text-sm text-green-400">{t("dashboard.form.saved")}</p>}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {status === "saving" ? t("dashboard.form.saving") : t("dashboard.form.save")}
          </button>
        </form>
      )}

      {tab === "addresses" && <AddressBook />}

      {tab === "security" && (
        <div className="space-y-4">
          <ChangePasswordForm />
          <ChangeEmailForm />
          <LogoutAllDevicesButton />
          <DeactivateAccountSection />
          <DeleteAccountSection />
        </div>
      )}

      {tab === "activity" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActivityCard
            title={t("accountPanel.activity.applicationsCard")}
            hint={t("accountPanel.activity.applicationsHint")}
            href="/dashboard/candidate"
          />
          <ActivityCard title={t("nav.messages")} hint={t("messages.hint")} href="/messages" />
          <ActivityCard
            title={t("accountPanel.activity.favoritesCard")}
            hint={t("accountPanel.activity.favoritesHint")}
            href="/favorites"
          />
        </div>
      )}
    </div>
  );
}

function CompanyAccountPanel() {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-company-profile"],
    queryFn: () => authFetch<CompanyProfileDto & AccountFields>(
      "/users/me/profile",
    ),
  });
  const { status, error, save } = useProfileSave("/users/me/profile/company", ["my-company-profile"]);
  const [tab, setTab] = useState<Tab>("profile");

  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [authorizedPersonName, setAuthorizedPersonName] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [mersisNumber, setMersisNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [hasActivityCertificate, setHasActivityCertificate] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setSector(profile.sector ?? "");
    setCity(profile.city);
    setDistrict(profile.district ?? "");
    setAddress(profile.address ?? "");
    setDescription(profile.description ?? "");
    setAuthorizedPersonName(profile.authorizedPersonName ?? "");
    setTaxOffice(profile.taxOffice ?? "");
    setTaxNumber(profile.taxNumber ?? "");
    setMersisNumber(profile.mersisNumber ?? "");
    setWebsite(profile.website ?? "");
    setCompanyEmail(profile.companyEmail ?? "");
    setPhoneVisible(profile.phoneVisible);
    setNotifyByEmail(profile.notifyByEmail);
    setHasActivityCertificate(profile.hasActivityCertificate);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await save({
      companyName,
      sector: sector || undefined,
      city,
      district: district || undefined,
      address: address || undefined,
      description: description || undefined,
      authorizedPersonName: authorizedPersonName || undefined,
      taxOffice: taxOffice || undefined,
      taxNumber: taxNumber || undefined,
      mersisNumber: mersisNumber || undefined,
      website: website || undefined,
      companyEmail: companyEmail || undefined,
      phoneVisible,
      notifyByEmail,
      hasActivityCertificate,
    });
  }

  if (isLoading || !profile) return <FormSkeleton rows={5} />;

  const tabs = [
    { id: "profile", label: t("accountPanel.tabs.profile") },
    { id: "corporate", label: t("accountPanel.tabs.corporate") },
    { id: "addresses", label: t("accountPanel.tabs.addresses") },
    { id: "privacy", label: t("accountPanel.tabs.privacy") },
    { id: "notifications", label: t("accountPanel.tabs.notifications") },
    { id: "security", label: t("accountPanel.tabs.security") },
    { id: "membership", label: t("accountPanel.tabs.membership") },
    { id: "activity", label: t("accountPanel.tabs.activity") },
  ];

  return (
    <div className="space-y-6">
      <AccountInfoCard
        email={profile.email}
        accountCreatedAt={profile.accountCreatedAt}
        lastLoginAt={profile.lastLoginAt}
        pendingEmail={profile.pendingEmail}
        isCorporate
      />
      <TabNav tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {(tab === "profile" || tab === "corporate" || tab === "privacy" || tab === "notifications") && (
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          {tab === "profile" && (
            <>
              <CompanyLogoUploader logoUrl={profile.logoUrl} queryKey="my-company-profile" />
              <UsernameField value={profile.username} queryKey="my-company-profile" />
              <Field label={t("dashboard.company.companyNameLabel")}>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </Field>
              <CompanyNameWarning name={companyName} />
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
            </>
          )}

          {tab === "corporate" && (
            <>
              <Field label={t("accountPanel.addressLabel")}>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.addressHint")}</p>
              <Field label={t("accountPanel.corporate.descriptionLabel")}>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.authorizedPersonLabel")}>
                <input
                  value={authorizedPersonName}
                  onChange={(e) => setAuthorizedPersonName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("accountPanel.corporate.taxOfficeLabel")}>
                <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.taxNumberLabel")}>
                <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.mersisLabel")}>
                <input value={mersisNumber} onChange={(e) => setMersisNumber(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.websiteLabel")}>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.companyEmailLabel")}>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-silver-400">
                <input
                  type="checkbox"
                  checked={hasActivityCertificate}
                  onChange={(e) => setHasActivityCertificate(e.target.checked)}
                />
                {t("accountPanel.certs.activityCertificate")}
              </label>
            </>
          )}

          {tab === "privacy" && (
            <>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={phoneVisible} onChange={(e) => setPhoneVisible(e.target.checked)} />
                {t("dashboard.company.phoneVisibleLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("dashboard.company.phoneVisibleHint")}</p>
            </>
          )}

          {tab === "notifications" && (
            <>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input
                  type="checkbox"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                />
                {t("accountPanel.notifications.newApplicationLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("accountPanel.notifications.newApplicationHint")}</p>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === "saved" && <p className="text-sm text-green-400">{t("dashboard.form.saved")}</p>}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {status === "saving" ? t("dashboard.form.saving") : t("dashboard.form.save")}
          </button>
        </form>
      )}

      {tab === "addresses" && <AddressBook />}

      {tab === "security" && (
        <div className="space-y-4">
          <ChangePasswordForm />
          <ChangeEmailForm />
          <LogoutAllDevicesButton />
          <DeactivateAccountSection />
          <DeleteAccountSection />
        </div>
      )}

      {tab === "membership" && (
        <div className="space-y-4">
          <VerificationStatusCard
            phoneVerified={!!profile.phoneVerifiedAt}
            membershipStatus={profile.membershipStatus}
            membershipExpiresAt={profile.membershipExpiresAt}
          />
          <MembershipHistoryList />
        </div>
      )}

      {tab === "activity" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActivityCard
            title={t("accountPanel.activity.listingsCard")}
            hint={t("accountPanel.activity.listingsHint")}
            href="/dashboard/company"
          />
          <ActivityCard title={t("nav.messages")} hint={t("messages.hint")} href="/messages" />
          <ActivityCard
            title={t("accountPanel.activity.favoritesCard")}
            hint={t("accountPanel.activity.favoritesHint")}
            href="/favorites"
          />
        </div>
      )}
    </div>
  );
}

function SupplierAccountPanel() {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-supplier-profile"],
    queryFn: () => authFetch<SupplierProfileDto & AccountFields>(
      "/users/me/profile",
    ),
  });
  const { status, error, save } = useProfileSave("/users/me/profile/supplier", ["my-supplier-profile"]);
  const [tab, setTab] = useState<Tab>("profile");

  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [authorizedPersonName, setAuthorizedPersonName] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [mersisNumber, setMersisNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [supplyCategories, setSupplyCategories] = useState<string[]>([]);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [hasActivityCertificate, setHasActivityCertificate] = useState(false);
  const [serviceRadiusKm, setServiceRadiusKm] = useState("");

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setCity(profile.city);
    setDistrict(profile.district ?? "");
    setAddress(profile.address ?? "");
    setDescription(profile.description ?? "");
    setAuthorizedPersonName(profile.authorizedPersonName ?? "");
    setTaxOffice(profile.taxOffice ?? "");
    setTaxNumber(profile.taxNumber ?? "");
    setMersisNumber(profile.mersisNumber ?? "");
    setWebsite(profile.website ?? "");
    setCompanyEmail(profile.companyEmail ?? "");
    setSupplyCategories(profile.supplyCategories);
    setPhoneVisible(profile.phoneVisible);
    setHasActivityCertificate(profile.hasActivityCertificate);
    setServiceRadiusKm(profile.serviceRadiusKm != null ? String(profile.serviceRadiusKm) : "");
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await save({
      companyName,
      city,
      district: district || undefined,
      address: address || undefined,
      description: description || undefined,
      authorizedPersonName: authorizedPersonName || undefined,
      taxOffice: taxOffice || undefined,
      taxNumber: taxNumber || undefined,
      mersisNumber: mersisNumber || undefined,
      website: website || undefined,
      companyEmail: companyEmail || undefined,
      supplyCategories,
      phoneVisible,
      hasActivityCertificate,
      serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : undefined,
    });
  }

  if (isLoading || !profile) return <FormSkeleton rows={5} />;

  const tabs = [
    { id: "profile", label: t("accountPanel.tabs.profile") },
    { id: "corporate", label: t("accountPanel.tabs.corporate") },
    { id: "addresses", label: t("accountPanel.tabs.addresses") },
    { id: "privacy", label: t("accountPanel.tabs.privacy") },
    { id: "security", label: t("accountPanel.tabs.security") },
    { id: "membership", label: t("accountPanel.tabs.membership") },
    { id: "activity", label: t("accountPanel.tabs.activity") },
  ];

  return (
    <div className="space-y-6">
      <AccountInfoCard
        email={profile.email}
        accountCreatedAt={profile.accountCreatedAt}
        lastLoginAt={profile.lastLoginAt}
        pendingEmail={profile.pendingEmail}
        isCorporate
      />
      <TabNav tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {(tab === "profile" || tab === "corporate" || tab === "privacy") && (
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          {tab === "profile" && (
            <>
              <CompanyLogoUploader logoUrl={profile.logoUrl} queryKey="my-supplier-profile" />
              <UsernameField value={profile.username} queryKey="my-supplier-profile" />
              <Field label={t("dashboard.supplier.companyNameLabel")}>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </Field>
              <CompanyNameWarning name={companyName} />
              <ProvinceDistrictSelect
                city={city}
                district={district}
                onCityChange={setCity}
                onDistrictChange={setDistrict}
                allowEmptyDistrict
              />
              <Field label={t("accountPanel.serviceRadiusLabel")}>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="50"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.serviceRadiusHint")}</p>
              <MaterialCategoryMultiSelect values={supplyCategories} onChange={setSupplyCategories} />
            </>
          )}

          {tab === "corporate" && (
            <>
              <Field label={t("accountPanel.addressLabel")}>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.addressHint")}</p>
              <Field label={t("accountPanel.corporate.descriptionLabel")}>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.authorizedPersonLabel")}>
                <input
                  value={authorizedPersonName}
                  onChange={(e) => setAuthorizedPersonName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("accountPanel.corporate.taxOfficeLabel")}>
                <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.taxNumberLabel")}>
                <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.mersisLabel")}>
                <input value={mersisNumber} onChange={(e) => setMersisNumber(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.websiteLabel")}>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.companyEmailLabel")}>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-silver-400">
                <input
                  type="checkbox"
                  checked={hasActivityCertificate}
                  onChange={(e) => setHasActivityCertificate(e.target.checked)}
                />
                {t("accountPanel.certs.activityCertificate")}
              </label>
            </>
          )}

          {tab === "privacy" && (
            <>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={phoneVisible} onChange={(e) => setPhoneVisible(e.target.checked)} />
                {t("dashboard.supplier.phoneVisibleLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("dashboard.supplier.phoneVisibleHint")}</p>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === "saved" && <p className="text-sm text-green-400">{t("dashboard.form.saved")}</p>}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {status === "saving" ? t("dashboard.form.saving") : t("dashboard.form.save")}
          </button>
        </form>
      )}

      {tab === "addresses" && <AddressBook />}

      {tab === "security" && (
        <div className="space-y-4">
          <ChangePasswordForm />
          <ChangeEmailForm />
          <LogoutAllDevicesButton />
          <DeactivateAccountSection />
          <DeleteAccountSection />
        </div>
      )}

      {tab === "membership" && (
        <div className="space-y-4">
          <VerificationStatusCard
            phoneVerified={!!profile.phoneVerifiedAt}
            membershipStatus={profile.membershipStatus}
            membershipExpiresAt={profile.membershipExpiresAt}
          />
          <MembershipHistoryList />
        </div>
      )}

      {tab === "activity" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActivityCard
            title={t("accountPanel.activity.listingsCard")}
            hint={t("accountPanel.activity.listingsHint")}
            href="/dashboard/supplier"
          />
          <ActivityCard
            title={t("accountPanel.activity.favoritesCard")}
            hint={t("accountPanel.activity.favoritesHint")}
            href="/favorites"
          />
        </div>
      )}
    </div>
  );
}

function SubcontractorAccountPanel() {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-subcontractor-profile"],
    queryFn: () =>
      authFetch<SubcontractorProfileDto & AccountFields>(
        "/users/me/profile",
      ),
  });
  const { status, error, save, setError } = useProfileSave("/users/me/profile/subcontractor", [
    "my-subcontractor-profile",
  ]);
  const [tab, setTab] = useState<Tab>("profile");

  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [tradeCategories, setTradeCategories] = useState<string[]>([
    TRADE_FIELDS[0].branches[0].professions[0].value,
  ]);
  const [description, setDescription] = useState("");
  const [authorizedPersonName, setAuthorizedPersonName] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [mersisNumber, setMersisNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [hasActivityCertificate, setHasActivityCertificate] = useState(false);
  const [serviceRadiusKm, setServiceRadiusKm] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setCity(profile.city);
    setDistrict(profile.district ?? "");
    setAddress(profile.address ?? "");
    setTradeCategories(profile.tradeCategories);
    setDescription(profile.description ?? "");
    setAuthorizedPersonName(profile.authorizedPersonName ?? "");
    setTaxOffice(profile.taxOffice ?? "");
    setTaxNumber(profile.taxNumber ?? "");
    setMersisNumber(profile.mersisNumber ?? "");
    setWebsite(profile.website ?? "");
    setCompanyEmail(profile.companyEmail ?? "");
    setIsPublic(profile.isPublic);
    setPhoneVisible(profile.phoneVisible);
    setHasActivityCertificate(profile.hasActivityCertificate);
    setServiceRadiusKm(profile.serviceRadiusKm != null ? String(profile.serviceRadiusKm) : "");
    setNotifyByEmail(profile.notifyByEmail);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (tradeCategories.length === 0) {
      setError(t("dashboard.subcontractor.minCategoryError"));
      return;
    }
    await save({
      companyName,
      city,
      district: district || undefined,
      address: address || undefined,
      tradeCategories,
      description: description || undefined,
      authorizedPersonName: authorizedPersonName || undefined,
      taxOffice: taxOffice || undefined,
      taxNumber: taxNumber || undefined,
      mersisNumber: mersisNumber || undefined,
      website: website || undefined,
      companyEmail: companyEmail || undefined,
      serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : undefined,
      isPublic,
      phoneVisible,
      hasActivityCertificate,
      notifyByEmail,
    });
  }

  if (isLoading || !profile) return <FormSkeleton rows={5} />;

  const tabs = [
    { id: "profile", label: t("accountPanel.tabs.profile") },
    { id: "corporate", label: t("accountPanel.tabs.corporate") },
    { id: "addresses", label: t("accountPanel.tabs.addresses") },
    { id: "privacy", label: t("accountPanel.tabs.privacy") },
    { id: "notifications", label: t("accountPanel.tabs.notifications") },
    { id: "security", label: t("accountPanel.tabs.security") },
    { id: "membership", label: t("accountPanel.tabs.membership") },
    { id: "activity", label: t("accountPanel.tabs.activity") },
  ];

  return (
    <div className="space-y-6">
      <AccountInfoCard
        email={profile.email}
        accountCreatedAt={profile.accountCreatedAt}
        lastLoginAt={profile.lastLoginAt}
        pendingEmail={profile.pendingEmail}
        isCorporate
      />
      <TabNav tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {(tab === "profile" || tab === "corporate" || tab === "privacy" || tab === "notifications") && (
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          {tab === "profile" && (
            <>
              <CompanyLogoUploader logoUrl={profile.logoUrl} queryKey="my-subcontractor-profile" />
              <UsernameField value={profile.username} queryKey="my-subcontractor-profile" />
              <Field label={t("dashboard.subcontractor.companyNameLabel")}>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </Field>
              <CompanyNameWarning name={companyName} />
              <TradeCategoryMultiSelect values={tradeCategories} onChange={setTradeCategories} />
              <ProvinceDistrictSelect
                city={city}
                district={district}
                onCityChange={setCity}
                onDistrictChange={setDistrict}
                allowEmptyDistrict
              />
              <Field label={t("accountPanel.serviceRadiusLabel")}>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="50"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.serviceRadiusHint")}</p>
            </>
          )}

          {tab === "corporate" && (
            <>
              <Field label={t("accountPanel.addressLabel")}>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
              </Field>
              <p className="-mt-2 text-xs text-silver-500">{t("accountPanel.addressHint")}</p>
              <Field label={t("dashboard.subcontractor.descriptionLabel")}>
                <textarea
                  rows={3}
                  placeholder={t("dashboard.subcontractor.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("accountPanel.corporate.authorizedPersonLabel")}>
                <input
                  value={authorizedPersonName}
                  onChange={(e) => setAuthorizedPersonName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("accountPanel.corporate.taxOfficeLabel")}>
                <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.taxNumberLabel")}>
                <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.mersisLabel")}>
                <input value={mersisNumber} onChange={(e) => setMersisNumber(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.websiteLabel")}>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("accountPanel.corporate.companyEmailLabel")}>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-silver-400">
                <input
                  type="checkbox"
                  checked={hasActivityCertificate}
                  onChange={(e) => setHasActivityCertificate(e.target.checked)}
                />
                {t("accountPanel.certs.activityCertificate")}
              </label>
            </>
          )}

          {tab === "privacy" && (
            <>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                {t("dashboard.subcontractor.publicLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("dashboard.subcontractor.publicHint")}</p>

              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input type="checkbox" checked={phoneVisible} onChange={(e) => setPhoneVisible(e.target.checked)} />
                {t("dashboard.subcontractor.phoneVisibleLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("dashboard.subcontractor.phoneVisibleHint")}</p>
            </>
          )}

          {tab === "notifications" && (
            <>
              <label className="flex items-center gap-2 text-sm text-silver-300">
                <input
                  type="checkbox"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                />
                {t("accountPanel.notifications.applicationStatusLabel")}
              </label>
              <p className="text-xs text-silver-500">{t("accountPanel.notifications.applicationStatusHint")}</p>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === "saved" && <p className="text-sm text-green-400">{t("dashboard.form.saved")}</p>}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {status === "saving" ? t("dashboard.form.saving") : t("dashboard.form.save")}
          </button>
        </form>
      )}

      {tab === "addresses" && <AddressBook />}

      {tab === "security" && (
        <div className="space-y-4">
          <ChangePasswordForm />
          <ChangeEmailForm />
          <LogoutAllDevicesButton />
          <DeactivateAccountSection />
          <DeleteAccountSection />
        </div>
      )}

      {tab === "membership" && (
        <div className="space-y-4">
          <VerificationStatusCard
            phoneVerified={!!profile.phoneVerifiedAt}
            membershipStatus={profile.membershipStatus}
            membershipExpiresAt={profile.membershipExpiresAt}
          />
          <MembershipHistoryList />
        </div>
      )}

      {tab === "activity" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActivityCard
            title={t("accountPanel.activity.favoritesCard")}
            hint={t("accountPanel.activity.favoritesHint")}
            href="/favorites"
          />
        </div>
      )}
    </div>
  );
}

function AdminAccountPanel() {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-admin-profile"],
    queryFn: () => authFetch<AccountFields>("/users/me/profile"),
  });
  const { status, error, save } = useProfileSave("/users/me/profile/admin", ["my-admin-profile"]);
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!profile) return;
    setTitle(profile.title ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await save({ title: title || undefined, phone: phone || undefined });
  }

  if (isLoading || !profile) return <FormSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <AccountInfoCard
        email={profile.email}
        accountCreatedAt={profile.accountCreatedAt}
        lastLoginAt={profile.lastLoginAt}
        pendingEmail={profile.pendingEmail}
        isCorporate={false}
        accountTypeLabel={t("accountPanel.accountTypeAdmin")}
      />
      <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
        <AdminPhotoUploader photoUrl={profile.photoUrl} />
        <Field label={t("accountPanel.admin.titleLabel")}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <Field label={t("dashboard.candidate.phoneLabel")}>
          <input
            placeholder="+905551234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {status === "saved" && <p className="text-sm text-green-400">{t("dashboard.form.saved")}</p>}
        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {status === "saving" ? t("dashboard.form.saving") : t("dashboard.form.save")}
        </button>
      </form>
      <div className="space-y-4">
        <ChangePasswordForm />
        <ChangeEmailForm />
        <LogoutAllDevicesButton />
        <DeleteAccountSection />
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLocale();

  if (authLoading) return <FormSkeleton rows={5} />;
  if (!user) return <p className="text-silver-500">{t("dashboard.candidate.roleGuard")}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-silver-300">{t("accountPanel.title")}</h1>
        <div className="h-1 w-12 rounded-full bg-gold-500" />
      </div>
      {user.role === "CANDIDATE" && <CandidateAccountPanel />}
      {user.role === "COMPANY" && <CompanyAccountPanel />}
      {user.role === "SUPPLIER" && <SupplierAccountPanel />}
      {user.role === "SUBCONTRACTOR" && <SubcontractorAccountPanel />}
      {user.role === "ADMIN" && <AdminAccountPanel />}
    </div>
  );
}
