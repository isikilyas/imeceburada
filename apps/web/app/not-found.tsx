"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <Image
        src="/logo.png"
        alt="İmece Burada"
        width={1257}
        height={349}
        className="h-16 w-auto rounded-xl opacity-80 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-black/10"
      />
      <p className="text-7xl font-bold text-gold-500/90">404</p>
      <div>
        <h1 className="text-xl font-semibold text-silver-200">{t("misc.notFound.heading")}</h1>
        <p className="mt-2 max-w-sm text-sm text-silver-500">
          {t("misc.notFound.description")}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-gold-500 px-6 py-3 font-medium text-ink-950 transition hover:bg-gold-400"
        >
          {t("misc.notFound.backHome")}
        </Link>
        <Link
          href="/jobs"
          className="rounded-md border border-ink-700 px-6 py-3 font-medium text-silver-300 transition hover:border-gold-500 hover:text-gold-400"
        >
          {t("misc.notFound.browseJobs")}
        </Link>
      </div>
    </div>
  );
}
