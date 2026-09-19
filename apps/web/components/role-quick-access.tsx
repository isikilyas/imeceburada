"use client";

import Link from "next/link";
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

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-sm font-semibold text-gold-400">
          <span>👤</span>
          {ROLE_LABELS[user.role]} {t("home.membershipTypeSuffix")}
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-silver-500">
          {t("home.quickAccessHeading")}
        </p>
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
