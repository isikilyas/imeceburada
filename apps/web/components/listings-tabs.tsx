"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";

interface ListingsTabsProps {
  active: "jobs" | "equipment" | "materials";
}

const TAB_DEFS: {
  key: "jobs" | "equipment" | "materials";
  href: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}[] = [
  {
    key: "jobs",
    href: "/jobs",
    icon: "👷",
    titleKey: "components.listingsTabs.jobsTitle",
    descriptionKey: "components.listingsTabs.jobsDesc",
  },
  {
    key: "equipment",
    href: "/equipment",
    icon: "🏗️",
    titleKey: "components.listingsTabs.equipmentTitle",
    descriptionKey: "components.listingsTabs.equipmentDesc",
  },
  {
    key: "materials",
    href: "/material-listings",
    icon: "🧱",
    titleKey: "components.listingsTabs.materialsTitle",
    descriptionKey: "components.listingsTabs.materialsDesc",
  },
];

export function ListingsTabs({ active }: ListingsTabsProps) {
  const { t } = useLocale();
  const TABS = TAB_DEFS.map((tab) => ({ ...tab, title: t(tab.titleKey), description: t(tab.descriptionKey) }));
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-lg border p-4 transition ${
              isActive
                ? "border-gold-500 bg-ink-900 shadow-[0_0_0_1px_rgba(212,175,55,0.35)]"
                : "border-ink-800 bg-ink-900 hover:border-gold-500/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className={`font-medium ${isActive ? "text-gold-400" : "text-silver-200"}`}>{tab.title}</span>
            </div>
            <p className="mt-1.5 text-xs leading-snug text-silver-500">{tab.description}</p>
          </Link>
        );
      })}
    </div>
  );
}