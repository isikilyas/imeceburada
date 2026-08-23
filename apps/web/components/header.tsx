"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchBox } from "@/components/search-box";
import Image from "next/image";

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

  const linkClass = "whitespace-nowrap hover:text-gold-400";
  const [accountOpen, setAccountOpen] = useState(false);

  const primaryLinks = (
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
    </>
  );

  const accountLinks: { href: string; label: string }[] = user
    ? [
        ...(user.role === "COMPANY" ? [{ href: "/candidates", label: t("nav.candidates") }] : []),
        ...(user.role === "COMPANY" ? [{ href: "/subcontractors", label: t("nav.subcontractors") }] : []),
        ...(user.role === "COMPANY" || user.role === "SUPPLIER" || user.role === "SUBCONTRACTOR"
          ? [{ href: "/membership", label: t("nav.membership") }]
          : []),
        ...(dashboardHref ? [{ href: dashboardHref, label: t("nav.dashboard") }] : []),
        { href: "/favorites", label: t("nav.favorites") },
      ]
    : [];

  const guestLinks = (
    <>
      <Link href="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
        {t("nav.login")}
      </Link>
      <Link
        href="/register"
        onClick={() => setMenuOpen(false)}
        className="whitespace-nowrap rounded-md bg-gold-500 px-3 py-1.5 text-center font-medium text-ink-950 hover:bg-gold-400"
      >
        {t("nav.register")}
      </Link>
    </>
  );

  // Mobil menüde hesap linkleri düz liste olarak, masaüstünde ise tek bir
  // "Hesabım" açılır menüsünde toplanıyor — çok fazla ayrı öge yatayda sığmıyordu.
  const mobileAccountLinks = user ? (
    <>
      {accountLinks.map((l) => (
        <Link key={l.href} href={l.href} className={linkClass} onClick={() => setMenuOpen(false)}>
          {l.label}
        </Link>
      ))}
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
    guestLinks
  );

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="transition hover:opacity-90" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="İmece Burada"
            width={259}
            height={72}
            className="h-10 w-auto rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-black/10 sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm xl:flex">
          {primaryLinks}

          {isLoading ? null : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-1.5 whitespace-nowrap text-silver-300 hover:text-gold-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
                </svg>
                {t("nav.account")}
                <span className="text-xs text-silver-500">▾</span>
              </button>

              {accountOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                  <div className="absolute end-0 top-full z-50 mt-2 w-52 rounded-md border border-ink-700 bg-ink-900 py-1 shadow-lg">
                    {accountLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setAccountOpen(false)}
                        className="block px-3 py-2 text-start text-sm text-silver-300 hover:bg-ink-800 hover:text-gold-400"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-ink-800" />
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                      className="block w-full px-3 py-2 text-start text-sm text-silver-500 hover:bg-ink-800 hover:text-gold-400"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            guestLinks
          )}

          <SearchBox className="w-40 2xl:w-56" />
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
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
        <nav className="flex flex-col gap-1 border-t border-ink-800 px-4 pb-4 pt-2 text-base [&>a]:block [&>a]:rounded-md [&>a]:px-3 [&>a]:py-2.5 [&>a]:hover:bg-ink-800 [&>button]:px-3 [&>button]:py-2.5 xl:hidden">
          <SearchBox className="mb-2 mt-1" onSubmit={() => setMenuOpen(false)} />
          {primaryLinks}
          {mobileAccountLinks}
        </nav>
      )}
    </header>
  );
}
