"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";

const CARD_DEFS: {
  key: string;
  href: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}[] = [
  {
    key: "jobs",
    href: "/jobs",
    icon: "👷",
    titleKey: "components.listingsHub.jobsTitle",
    descriptionKey: "components.listingsHub.jobsDesc",
  },
  {
    key: "candidates",
    href: "/candidates",
    icon: "🧑‍🔧",
    titleKey: "components.listingsHub.candidatesTitle",
    descriptionKey: "components.listingsHub.candidatesDesc",
  },
  {
    key: "subcontractors",
    href: "/subcontractors",
    icon: "🏢",
    titleKey: "components.listingsHub.subcontractorsTitle",
    descriptionKey: "components.listingsHub.subcontractorsDesc",
  },
  {
    key: "equipment",
    href: "/equipment",
    icon: "🏗️",
    titleKey: "components.listingsHub.equipmentTitle",
    descriptionKey: "components.listingsHub.equipmentDesc",
  },
  {
    key: "materials",
    href: "/material-listings",
    icon: "🧱",
    titleKey: "components.listingsHub.materialsTitle",
    descriptionKey: "components.listingsHub.materialsDesc",
  },
  {
    key: "siteRadar",
    href: "/site-radar",
    icon: "📡",
    titleKey: "components.listingsHub.siteRadarTitle",
    descriptionKey: "components.listingsHub.siteRadarDesc",
  },
  {
    key: "wageIndex",
    href: "/wage-index",
    icon: "💰",
    titleKey: "components.listingsHub.wageIndexTitle",
    descriptionKey: "components.listingsHub.wageIndexDesc",
  },
  {
    key: "materialIndex",
    href: "/material-index",
    icon: "📊",
    titleKey: "components.listingsHub.materialIndexTitle",
    descriptionKey: "components.listingsHub.materialIndexDesc",
  },
];

export default function ListingsHubPage() {
  const { t } = useLocale();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-silver-300">{t("components.listingsHub.heading")}</h1>
      <p className="mb-6 text-sm text-silver-500">{t("components.listingsHub.intro")}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_DEFS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-lg border border-ink-800 bg-ink-900 p-4 transition hover:border-gold-500/60"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">{card.icon}</span>
              <span className="font-medium text-silver-200">{t(card.titleKey)}</span>
            </div>
            <p className="mt-1.5 text-xs leading-snug text-silver-500">{t(card.descriptionKey)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
