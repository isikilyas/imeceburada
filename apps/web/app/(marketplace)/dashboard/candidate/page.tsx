"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ApplicationDto, CandidateProfileDto } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { WageScaleCard } from "@/components/wage-scale-card";
import { FormSkeleton } from "@/components/form-skeleton";
import { ListSkeleton } from "@/components/list-skeleton";

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
              <div
                key={app.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
              >
                <Link href={`/jobs/${app.jobId}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-silver-200">{app.jobTitle}</p>
                  <span className="text-sm text-silver-500">{t(`dashboard.applicationStatus.${app.status}`)}</span>
                  {app.offeredWage != null && (
                    <p className="mt-1 text-xs text-gold-400">
                      Firmanın teklifi: {app.offeredWage.toLocaleString("tr-TR")} ₺/ay
                    </p>
                  )}
                </Link>
                <Link href={`/messages/${app.id}`} className="shrink-0 text-sm text-gold-400 hover:underline">
                  {t("nav.messages")}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-silver-300">{t("dashboard.candidate.profileHeading")}</h2>
          <Link
            href="/account"
            className="block rounded-lg border border-ink-800 bg-ink-900 p-4 text-sm text-gold-400 hover:border-gold-500"
          >
            {t("accountPanel.goToAccountLink")}
          </Link>
        </section>
      </div>
    </div>
  );
}