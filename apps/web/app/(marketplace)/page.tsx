"use client";

import Link from "next/link";
import { WeatherWidget } from "@/components/weather-widget";
import { HomeStats } from "@/components/home-stats";
import { SupplierSpotlight } from "@/components/supplier-spotlight";
import { AdSlot } from "@/components/ad-slot";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/locale-context";

export default function HomePage() {
  const { t } = useLocale();

  const PILLARS = [
    { icon: "🛡️", label: t("home.pillarTrust") },
    { icon: "🏗️", label: t("home.pillarExperience") },
    { icon: "⚙️", label: t("home.pillarTech") },
    { icon: "🚀", label: t("home.pillarFuture") },
  ];

  const MODULES = [
    { href: "/jobs", icon: "👷", title: t("home.moduleJobsTitle"), desc: t("home.moduleJobsDesc") },
    { href: "/equipment", icon: "🏗️", title: t("home.moduleEquipmentTitle"), desc: t("home.moduleEquipmentDesc") },
    {
      href: "/material-listings",
      icon: "🧱",
      title: t("home.moduleMaterialsTitle"),
      desc: t("home.moduleMaterialsDesc"),
    },
    {
      href: "/site-radar",
      icon: "📍",
      title: t("home.moduleSiteRadarTitle"),
      desc: t("home.moduleSiteRadarDesc"),
    },
    {
      href: "/wage-index",
      icon: "📊",
      title: t("home.moduleWageIndexTitle"),
      desc: t("home.moduleWageIndexDesc"),
    },
  ];

  const STEPS = [
    { n: "01", title: t("home.step1Title"), desc: t("home.step1Desc") },
    { n: "02", title: t("home.step2Title"), desc: t("home.step2Desc") },
    { n: "03", title: t("home.step3Title"), desc: t("home.step3Desc") },
  ];

  return (
    <div className="flex flex-col">
      <AdSlot side="left" />
      <AdSlot side="right" />
      {/* Hero — logo-led, with a layered glow backdrop for a premium first impression */}
      <section className="blueprint-grid hero-glow relative -mx-4 overflow-hidden px-4 pb-8 pt-20 sm:-mx-6 sm:px-6 sm:pb-10 sm:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="animate-fade-in-up relative mx-auto mb-8 flex h-20 w-64 items-center justify-center sm:h-24 sm:w-80">
            <div className="logo-halo animate-float-slow absolute inset-0" />
            <Image
              src="/logo.png"
              alt="İmece Burada"
              width={1257}
              height={349}
              priority
              className="relative h-full w-auto rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/10"
            />
          </div>

          <p
            className="animate-fade-in-up text-sm font-bold uppercase tracking-[0.12em] text-silver-200 sm:text-base"
            style={{ animationDelay: "60ms" }}
          >
            {t("home.heroKicker")}
          </p>
          <h1
            className="animate-fade-in-up mt-4 font-semibold leading-tight text-gold-400"
            style={{ animationDelay: "120ms" }}
          >
            <span className="block text-4xl sm:text-5xl">{t("home.heroHeadlineTop")}</span>
            <span className="block whitespace-nowrap text-xs sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl">
              {t("home.heroHeadlineRest")}
            </span>
          </h1>
          <p
            className="animate-fade-in-up mx-auto mt-5 max-w-xl text-balance text-silver-500"
            style={{ animationDelay: "180ms" }}
          >
            {t("home.heroText")}
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/jobs"
              className="rounded-md bg-gold-500 px-6 py-3 font-medium text-ink-950 shadow-[0_0_24px_rgba(212,175,55,0.35)] transition hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_0_32px_rgba(212,175,55,0.5)]"
            >
              {t("home.browseListings")}
            </Link>
            <Link
              href="/wage-index"
              className="rounded-md border border-ink-700 px-6 py-3 font-medium text-silver-300 transition hover:-translate-y-0.5 hover:border-gold-500 hover:text-gold-400"
            >
              {t("home.viewIndex")}
            </Link>
          </div>
        </div>
      </section>

      {/* Weather — a full weekly overview, sized to match the stats panel below it */}
      <div className="flex justify-center px-4 py-4 sm:px-6">
        <WeatherWidget />
      </div>

      {/* Stats — an elevated panel with a soft gold glow instead of a bare divided row */}
      <section className="px-4 sm:px-6">
        <div className="gradient-border relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-ink-900/60 py-10 shadow-[0_0_40px_-12px_rgba(212,175,55,0.15)] ring-1 ring-inset ring-ink-800">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-silver-500">
            {t("home.statsHeading")}
          </p>
          <HomeStats />
        </div>
      </section>

      {/* Modules */}
      <section className="py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-silver-200 sm:text-3xl">{t("home.modulesHeading")}</h2>
          <p className="mt-2 text-sm text-silver-500">{t("home.modulesSubheading")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="gradient-border group relative flex flex-col gap-3 overflow-hidden rounded-xl bg-ink-900 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-ink-800 hover:shadow-[0_12px_32px_-12px_rgba(212,175,55,0.3)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500/10 text-2xl ring-1 ring-inset ring-gold-500/20 transition group-hover:scale-110 group-hover:bg-gold-500/15">
                {m.icon}
              </div>
              <h3 className="font-medium text-silver-200">{m.title}</h3>
              <p className="text-xs leading-snug text-silver-500">{m.desc}</p>
              <span className="mt-auto flex items-center pt-1 text-gold-400 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SupplierSpotlight />

      {/* How it works */}
      <section className="py-16">
        <h2 className="mb-12 text-center text-2xl font-semibold text-silver-200 sm:text-3xl">
          {t("home.howItWorks")}
        </h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative flex flex-col items-center gap-3 text-center">
              {i < STEPS.length - 1 && (
                <div className="absolute start-1/2 top-6 hidden h-px w-full bg-gradient-to-r from-gold-500/40 via-ink-700 to-transparent rtl:bg-gradient-to-l sm:block" />
              )}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold-500 bg-ink-950 font-semibold text-gold-400 shadow-[0_0_16px_-2px_rgba(212,175,55,0.4)]">
                {s.n}
              </div>
              <h3 className="font-medium text-silver-200">{s.title}</h3>
              <p className="max-w-[220px] text-xs leading-relaxed text-silver-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip — a slim horizontal row instead of four separate boxes */}
      <section className="border-y border-ink-800 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PILLARS.map((pillar, i) => (
            <div key={pillar.label} className="flex items-center gap-4">
              {i > 0 && <span className="hidden h-4 w-px bg-ink-700 sm:block" />}
              <div className="flex items-center gap-2 text-sm font-medium text-gold-500">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500/10 text-base ring-1 ring-inset ring-gold-500/20">
                  {pillar.icon}
                </span>
                {pillar.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative my-16 overflow-hidden rounded-2xl bg-gradient-to-b from-ink-900 to-ink-950 p-10 text-center ring-1 ring-inset ring-gold-500/20">
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold text-silver-200 sm:text-3xl">{t("home.ctaHeading")}</h2>
          <p className="max-w-lg text-sm text-silver-500">{t("home.ctaDesc")}</p>
          <Link
            href="/register"
            className="rounded-md bg-gold-500 px-6 py-3 font-medium text-ink-950 shadow-[0_0_24px_rgba(212,175,55,0.3)] transition hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_0_32px_rgba(212,175,55,0.45)]"
          >
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>
    </div>
  );
}