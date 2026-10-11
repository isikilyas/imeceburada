"use client";

import Link from "next/link";
import { useState } from "react";
import { UserRole } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/icon";

interface QuickLink {
  href: string;
  icon: string;
  label: string;
}

/** auth-form.tsx'teki ROLE_LABELS ile aynı — üyelik türü burada da aynı hedef-odaklı adlarla gösterilir. */
const ROLE_LABELS: Record<UserRole, string> = {
  CANDIDATE: "İş Arıyorum",
  COMPANY: "Personel / Taşeron Arıyorum",
  SUPPLIER: "Malzeme / Ekipman Satıyorum",
  SUBCONTRACTOR: "Taşeron Olarak İş Arıyorum",
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
      { href: "/jobs", icon: "work_outline", label: t("home.moduleJobsTitle") },
      { href: "/dashboard/candidate", icon: "assignment", label: t("nav.dashboard") },
      { href: "/favorites", icon: "star", label: t("nav.favorites") },
    ];
  } else if (user.role === "COMPANY") {
    links = [
      { href: "/candidates", icon: "engineering", label: t("nav.candidates") },
      { href: "/subcontractors", icon: "apartment", label: t("nav.subcontractors") },
      { href: "/dashboard/company", icon: "assignment", label: t("nav.dashboard") },
    ];
  } else if (user.role === "SUPPLIER") {
    links = [
      { href: "/dashboard/supplier", icon: "assignment", label: t("nav.dashboard") },
      { href: "/material-index", icon: "show_chart", label: t("nav.materialIndex") },
      { href: "/membership", icon: "credit_card", label: t("nav.membership") },
    ];
  } else if (user.role === "SUBCONTRACTOR") {
    links = [
      { href: "/jobs?listingType=SUBCONTRACTOR", icon: "work_outline", label: t("home.quickAccessSubcontractorJobs") },
      { href: "/dashboard/subcontractor", icon: "assignment", label: t("nav.dashboard") },
      { href: "/equipment", icon: "construction", label: t("home.moduleEquipmentTitle") },
    ];
  } else if (user.role === "ADMIN") {
    links = [{ href: "/account", icon: "settings", label: t("nav.accountPanel") }];
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
    { href: dashboardHref, icon: "edit_note", label: t("home.quickAccessSearchCreateListing") },
    { href: "/jobs", icon: "work_outline", label: t("home.quickAccessSearchJobs") },
    { href: "/candidates", icon: "engineering", label: t("home.quickAccessSearchCandidates") },
    { href: "/subcontractors", icon: "apartment", label: t("home.quickAccessSearchSubcontractors") },
    { href: "/equipment", icon: "construction", label: t("home.quickAccessSearchEquipment") },
    { href: "/material-listings", icon: "inventory_2", label: t("home.quickAccessSearchMaterials") },
  ];

  // Arama çubuğuyla aynı hedefe giden kartları gösterme — tekrarı önler.
  const searchHrefs = new Set(searchOptions.map((o) => o.href));
  const gridLinks = links.filter((l) => !searchHrefs.has(l.href));

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-sm font-semibold text-gold-400">
          <Icon name="person" className="text-base" />
          {ROLE_LABELS[user.role]} {t("home.membershipTypeSuffix")}
        </div>
        <p className="mb-3 text-lg font-semibold text-silver-200 sm:text-xl">{t("home.quickAccessHeading")}</p>
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-left transition hover:border-gold-500/40"
          >
            <Icon name="search" className="text-silver-500" />
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
                    <Icon name={opt.icon} className="text-gold-400" />
                    {opt.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        {gridLinks.length > 0 && (
          <div className={`grid grid-cols-2 gap-3 ${gridLinks.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
            {gridLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="gradient-border group flex flex-col items-center gap-2 rounded-xl bg-ink-900 px-4 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:bg-ink-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 ring-1 ring-inset ring-gold-500/20 transition group-hover:scale-110">
                  <Icon name={l.icon} className="text-gold-400" />
                </span>
                <span className="text-sm font-medium text-silver-200">{l.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
