"use client";

import Link from "next/link";
import { useState } from "react";
import { UserRole } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";

interface QuickLink {
  href: string;
  icon: string;
  label: string;
}

/** register/page.tsx'teki ROLE_LABELS ile aynı — üyelik türü burada da aynı adlarla gösterilir. */
const ROLE_LABELS: Record<UserRole, string> = {
  CANDIDATE: "İş Arayan Personel",
  COMPANY: "Firma",
  SUPPLIER: "Yapı Tedarik",
  SUBCONTRACTOR: "Taşeron Firma",
  ADMIN: "Yönetici",
};

/**
 * Giriş yapmış kullanıcıya, rolüne göre en çok ihtiyaç duyacağı sayfalara
 * tek tıkla ulaşım sağlayan kısayol kartları — ana sayfanın en üstünde.
 * Misafir kullanıcıya hiçbir şey göstermez (ana sayfanın pazarlama içeriği
 * onlar için değişmeden kalır).
 */
export function RoleQuickAccess() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [searchOpen, setSearchOpen] = useState(false);

  if (!user) return null;

  let links: QuickLink[] = [];
  if (user.role === "CANDIDATE") {
    links = [
      { href: "/jobs", icon: "👷", label: t("home.moduleJobsTitle") },
      { href: "/dashboard/candidate", icon: "📋", label: t("nav.dashboard") },
      { href: "/favorites", icon: "⭐", label: t("nav.favorites") },
    ];
  } else if (user.role === "COMPANY") {
    links = [
      { href: "/candidates", icon: "🔍", label: t("nav.candidates") },
      { href: "/subcontractors", icon: "🏢", label: t("nav.subcontractors") },
      { href: "/dashboard/company", icon: "📋", label: t("nav.dashboard") },
    ];
  } else if (user.role === "SUPPLIER") {
    links = [
      { href: "/dashboard/supplier", icon: "📋", label: t("nav.dashboard") },
      { href: "/material-index", icon: "📊", label: t("nav.materialIndex") },
      { href: "/membership", icon: "💳", label: t("nav.membership") },
    ];
  } else if (user.role === "SUBCONTRACTOR") {
    links = [
      { href: "/jobs?listingType=SUBCONTRACTOR", icon: "👷", label: t("home.quickAccessSubcontractorJobs") },
      { href: "/dashboard/subcontractor", icon: "📋", label: t("nav.dashboard") },
      { href: "/equipment", icon: "🏗️", label: t("home.moduleEquipmentTitle") },
    ];
  } else if (user.role === "ADMIN") {
    links = [{ href: "/account", icon: "⚙️", label: t("nav.accountPanel") }];
  }

  if (links.length === 0) return null;

  const dashboardHref =
    user.role === "CANDIDATE"
      ? "/dashboard/candidate"
      : user.role === "COMPANY"
        ? "/dashboard/company"
        : user.role === "SUPPLIER"
          ? "/dashboard/supplier"
          : user.role === "SUBCONTRACTOR"
            ? "/dashboard/subcontractor"
            : "/account";

  const searchOptions: QuickLink[] = [
    { href: dashboardHref, icon: "📝", label: t("home.quickAccessSearchCreateListing") },
    { href: "/jobs", icon: "👷", label: t("home.quickAccessSearchJobs") },
    { href: "/candidates", icon: "🔍", label: t("home.quickAccessSearchCandidates") },
    { href: "/subcontractors", icon: "🏢", label: t("home.quickAccessSearchSubcontractors") },
    { href: "/equipment", icon: "🏗️", label: t("home.quickAccessSearchEquipment") },
    { href: "/material-listings", icon: "🧱", label: t("home.quickAccessSearchMaterials") },
  ];

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-sm font-semibold text-gold-400">
          <span>👤</span>
          {ROLE_LABELS[user.role]} {t("home.membershipTypeSuffix")}
        </div>
        <p className="mb-3 text-lg font-semibold text-silver-200 sm:text-xl">{t("home.quickAccessHeading")}</p>
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-left transition hover:border-gold-500/40"
          >
            <span className="text-silver-500">🔍</span>
            <span className="text-sm text-silver-500">{t("home.quickAccessSearchPlaceholder")}</span>
          </button>
          {searchOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSearchOpen(false)} />
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-xl">
                {searchOptions.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-silver-200 transition hover:bg-ink-800"
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <div className={`grid grid-cols-2 gap-3 ${links.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="gradient-border group flex flex-col items-center gap-2 rounded-xl bg-ink-900 px-4 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:bg-ink-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-xl ring-1 ring-inset ring-gold-500/20 transition group-hover:scale-110">
                {l.icon}
              </span>
              <span className="text-sm font-medium text-silver-200">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
