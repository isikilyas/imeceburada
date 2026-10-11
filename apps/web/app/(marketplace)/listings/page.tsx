"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/icon";

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
    icon: "work_outline",
    titleKey: "components.listingsHub.jobsTitle",
    descriptionKey: "components.listingsHub.jobsDesc",
  },
  {
    key: "candidates",
    href: "/candidates",
    icon: "engineering",
    titleKey: "components.listingsHub.candidatesTitle",
    descriptionKey: "components.listingsHub.candidatesDesc",
  },
  {
    key: "subcontractors",
    href: "/subcontractors",
    icon: "apartment",
    titleKey: "components.listingsHub.subcontractorsTitle",
    descriptionKey: "components.listingsHub.subcontractorsDesc",
  },
  {
    key: "equipment",
    href: "/equipment",
    icon: "construction",
    titleKey: "components.listingsHub.equipmentTitle",
    descriptionKey: "components.listingsHub.equipmentDesc",
  },
  {
    key: "materials",
    href: "/material-listings",
    icon: "inventory_2",
    titleKey: "components.listingsHub.materialsTitle",
    descriptionKey: "components.listingsHub.materialsDesc",
  },
  {
    key: "siteRadar",
    href: "/site-radar",
    icon: "map",
    titleKey: "components.listingsHub.siteRadarTitle",
    descriptionKey: "components.listingsHub.siteRadarDesc",
  },
  {
    key: "wageIndex",
    href: "/wage-index",
    icon: "payments",
    titleKey: "components.listingsHub.wageIndexTitle",
    descriptionKey: "components.listingsHub.wageIndexDesc",
  },
  {
    key: "materialIndex",
    href: "/material-index",
    icon: "show_chart",
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
              <Icon name={card.icon} className="text-xl text-gold-400" />
              <span className="font-medium text-silver-200">{t(card.titleKey)}</span>
            </div>
            <p className="mt-1.5 text-xs leading-snug text-silver-500">{t(card.descriptionKey)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
