"use client";

import Link from "next/link";

interface ListingsTabsProps {
  active: "jobs" | "equipment" | "materials";
}

const TABS: {
  key: "jobs" | "equipment" | "materials";
  href: string;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    key: "jobs",
    href: "/jobs",
    icon: "👷",
    title: "İş İlanları",
    description: "Usta, işçi ve teknik personel ilanları",
  },
  {
    key: "equipment",
    href: "/equipment",
    icon: "🏗️",
    title: "Ekipman Arıyorum",
    description: "Kiralık iş makinesi ve ekipman ilanları",
  },
  {
    key: "materials",
    href: "/material-listings",
    icon: "🧱",
    title: "Malzeme İlanları",
    description: "Tedarikçilerden inşaat malzemesi ilanları",
  },
];

export function ListingsTabs({ active }: ListingsTabsProps) {
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