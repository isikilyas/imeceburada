"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteRequestDto, SITE_REQUEST_TYPES, TRADE_CATEGORIES, EQUIPMENT_TYPES } from "@bau360/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { SiteMap } from "@/components/site-map";
import { ListSkeleton } from "@/components/list-skeleton";
import { useLocale } from "@/lib/i18n/locale-context";

function requestSubtitle(r: SiteRequestDto) {
  const kind =
    r.requestType === "WORKER"
      ? TRADE_CATEGORIES.find((t) => t.value === r.tradeCategory)?.label
      : EQUIPMENT_TYPES.find((e) => e.value === r.equipmentType)?.label;
  return `${kind ?? ""} · ${r.city} · ${r.neededCount} adet`;
}

export default function SiteRadarPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [requestType, setRequestType] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["site-requests", requestType],
    queryFn: () =>
      apiFetch<SiteRequestDto[]>(`/site-requests${requestType ? `?requestType=${requestType}` : ""}`),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-silver-300">{t("pages.siteRadarHeading")}</h1>
        {user && (
          <div className="flex gap-3 text-sm">
            <Link href="/site-radar/mine" className="text-gold-400 hover:underline">
              {t("siteRadar.mine.heading")}
            </Link>
            <Link
              href="/site-radar/new"
              className="rounded-md bg-gold-500 px-3 py-1.5 font-medium text-ink-950 hover:bg-gold-400"
            >
              {t("siteRadar.new.heading")}
            </Link>
          </div>
        )}
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <button
          onClick={() => setRequestType("")}
          className={`rounded-md px-3 py-1.5 ${requestType === "" ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-400"}`}
        >
          {t("filters.all")}
        </button>
        {SITE_REQUEST_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setRequestType(t.value)}
            className={`rounded-md px-3 py-1.5 ${requestType === t.value ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-400"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SiteMap
        markers={(requests ?? []).map((r) => ({
          id: r.id,
          latitude: r.latitude,
          longitude: r.longitude,
          title: r.title,
          subtitle: requestSubtitle(r),
        }))}
        onMarkerClick={(id) => router.push(`/site-radar/${id}`)}
        height="28rem"
      />

      <div className="mt-6 space-y-3">
        {isLoading && <ListSkeleton count={4} />}
        {!isLoading && requests?.length === 0 && <p className="text-silver-500">{t("siteRadar.list.empty")}</p>}
        {requests?.map((r) => (
          <Link
            key={r.id}
            href={`/site-radar/${r.id}`}
            className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-silver-200">{r.title}</p>
                <p className="text-xs text-silver-500">{requestSubtitle(r)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">
                {t("siteRadar.list.responseCount", { count: r.responseCount })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
