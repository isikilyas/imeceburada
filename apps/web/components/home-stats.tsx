"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function StatTile({ value, label, icon, delay }: { value: number; label: string; icon: string; delay: number }) {
  const animated = useCountUp(value);
  return (
    <div
      className="animate-fade-in-up group flex flex-col items-center gap-2 rounded-xl px-4 py-3 text-center transition hover:-translate-y-1 hover:bg-ink-800/40"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-2xl ring-1 ring-inset ring-gold-500/20 transition group-hover:ring-gold-500/40">
        {icon}
      </div>
      <p className="text-3xl font-semibold text-gold-400 sm:text-4xl">{animated.toLocaleString("tr-TR")}</p>
      <p className="text-xs uppercase tracking-wide text-silver-500">{label}</p>
    </div>
  );
}

interface Totals {
  jobs: number;
  equipment: number;
  materials: number;
}

export function HomeStats() {
  const { t } = useLocale();
  const { data } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async (): Promise<Totals> => {
      const [jobs, equipment, materials] = await Promise.all([
        apiFetch<{ total: number }>("/jobs?pageSize=1"),
        apiFetch<{ total: number }>("/equipment?pageSize=1"),
        apiFetch<{ total: number }>("/material-listings?pageSize=1"),
      ]);
      return { jobs: jobs.total, equipment: equipment.total, materials: materials.total };
    },
  });

  const totals = data ?? { jobs: 0, equipment: 0, materials: 0 };

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-ink-800">
      <StatTile icon="👷" value={totals.jobs} label={t("home.statJobs")} delay={0} />
      <StatTile icon="🏗️" value={totals.equipment} label={t("home.statEquipment")} delay={80} />
      <StatTile icon="🧱" value={totals.materials} label={t("home.statMaterials")} delay={160} />
      <StatTile icon="🗺️" value={81} label={t("home.statProvinces")} delay={240} />
    </div>
  );
}