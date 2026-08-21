"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchBox } from "@/components/search-box";

export function Header() {
  const { user, isLoading, logout } = useAuth();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref =
    user?.role === "COMPANY"
      ? "/dashboard/company"
      : user?.role === "CANDIDATE"
        ? "/dashboard/candidate"
        : user?.role === "SUPPLIER"
          ? "/dashboard/supplier"
          : user?.role === "SUBCONTRACTOR"
            ? "/dashboard/subcontractor"
            : null;

  const linkClass = "hover:text-gold-400";

  const navLinks = (
    <>
      <Link href="/jobs" className={linkClass} onClick={() => setMenuOpen(false)}>
        {t("nav.listings")}
      </Link>
      <Link href="/wage-index" className={linkClass} onClick={() => setMenuOpen(false)}>
        {t("nav.wageIndex")}
      </Link>
      <Link href="/material-index" className={linkClass} onClick={() => setMenuOpen(false)}>
        {t("nav.materialIndex")}
      </Link>
      <Link href="/site-radar" className={linkClass} onClick={() => setMenuOpen(false)}>
        {t("nav.siteRadar")}
      </Link>

      {isLoading ? null : user ? (
        <>
          {user.role === "COMPANY" && (
            <>
              <Link href="/candidates" className={linkClass} onClick={() => setMenuOpen(false)}>
                {t("nav.candidates")}
              </Link>
              <Link href="/subcontractors" className={linkClass} onClick={() => setMenuOpen(false)}>
                {t("nav.subcontractors")}
              </Link>
            </>
          )}
          {(user.role === "COMPANY" || user.role === "SUPPLIER" || user.role === "SUBCONTRACTOR") && (
            <Link href="/membership" className={linkClass} onClick={() => setMenuOpen(false)}>
              {t("nav.membership")}
            </Link>
          )}
          {dashboardHref && (
            <Link href={dashboardHref} className={linkClass} onClick={() => setMenuOpen(false)}>
              {t("nav.dashboard")}
            </Link>
          )}
          <Link href="/favorites" className={linkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.favorites")}
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="text-start text-silver-500 hover:text-gold-400"
          >
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.login")}
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="rounded-md bg-gold-500 px-3 py-1.5 text-center font-medium text-ink-950 hover:bg-gold-400"
          >
            {t("nav.register")}
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="transition hover:opacity-90" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="İmece Yapı"
            width={132}
            height={72}
            className="h-10 w-auto rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-black/10 sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm lg:flex">
          {navLinks}
          <SearchBox className="w-44 xl:w-56" />
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-silver-300 hover:bg-ink-800 hover:text-gold-400"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-ink-800 px-4 pb-4 pt-2 text-base [&>a]:block [&>a]:rounded-md [&>a]:px-3 [&>a]:py-2.5 [&>a]:hover:bg-ink-800 [&>button]:px-3 [&>button]:py-2.5 lg:hidden">
          <SearchBox className="mb-2 mt-1" onSubmit={() => setMenuOpen(false)} />
          {navLinks}
        </nav>
      )}
    </header>
  );
}
