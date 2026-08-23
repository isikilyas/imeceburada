"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { AppStoreBadge, GooglePlayBadge, AppGalleryBadge } from "@/components/store-badges";
import Image from "next/image";

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <Image
              src="/logo.png"
              alt="İmece Burada"
              width={259}
              height={72}
              className="h-10 w-auto rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-black/10"
            />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-silver-500">
              İnşaat sektörüne özel iş ilanları, ekipman/malzeme pazaryeri ve canlı piyasa endeksi.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-silver-500">Keşfet</span>
            <Link href="/jobs" className="text-silver-400 hover:text-gold-400">
              {t("nav.listings")}
            </Link>
            <Link href="/wage-index" className="text-silver-400 hover:text-gold-400">
              {t("nav.wageIndex")}
            </Link>
            <Link href="/site-radar" className="text-silver-400 hover:text-gold-400">
              {t("nav.siteRadar")}
            </Link>
            <Link href="/membership" className="text-silver-400 hover:text-gold-400">
              {t("nav.membership")}
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t border-ink-800 pt-8">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-silver-500">
            Mobil Uygulamamızı İndirin
          </span>
          <div className="flex items-stretch gap-2 sm:gap-3">
            <AppStoreBadge href="#" />
            <GooglePlayBadge href="#" />
            <AppGalleryBadge href="#" />
          </div>
        </div>

        <div className="mt-8 border-t border-ink-800 pt-6 text-center text-xs text-silver-500 sm:text-start">
          © {year} İmece Burada. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
