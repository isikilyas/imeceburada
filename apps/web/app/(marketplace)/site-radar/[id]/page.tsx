"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EQUIPMENT_TYPES, SiteRequestDto, TRADE_CATEGORIES } from "@bau360/shared";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { SiteMap } from "@/components/site-map";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";

export default function SiteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ["site-request", id],
    queryFn: () => apiFetch<SiteRequestDto>(`/site-requests/${id}`),
  });

  async function handleRespond() {
    setStatus("submitting");
    setError(null);
    try {
      await authFetch(`/site-requests/${id}/responses`, {
        method: "POST",
        body: JSON.stringify({ message: message || undefined }),
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("siteRadar.detail.respondError"));
      setStatus("error");
    }
  }

  if (isLoading) return <p className="text-silver-500">{t("common.loading")}</p>;
  if (!request) return <p className="text-silver-500">{t("siteRadar.detail.notFound")}</p>;

  const kindLabel =
    request.requestType === "WORKER"
      ? TRADE_CATEGORIES.find((t) => t.value === request.tradeCategory)?.label
      : EQUIPMENT_TYPES.find((e) => e.value === request.equipmentType)?.label;

  const isOwner = user?.id === request.createdById;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-block rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">
            {kindLabel}
          </span>
          <h1 className="text-2xl font-semibold text-silver-200">{request.title}</h1>
        </div>
        <WhatsAppShareButton
          text={t("siteRadar.detail.shareText", {
            title: request.title,
            city: request.city,
            count: request.neededCount,
          })}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 transition hover:border-green-500 hover:text-green-400"
        />
      </div>
      <p className="mt-1 text-silver-500">
        {t("siteRadar.detail.summaryLine", { name: request.createdByName, city: request.city, count: request.neededCount })}
      </p>
      {request.neededBy && (
        <p className="mt-1 text-sm text-silver-500">
          {t("siteRadar.detail.deadline", { date: new Date(request.neededBy).toLocaleString("tr-TR") })}
        </p>
      )}

      <p className="mt-6 whitespace-pre-wrap text-silver-300">{request.description}</p>

      <div className="mt-6">
        <SiteMap
          markers={[{ id: request.id, latitude: request.latitude, longitude: request.longitude, title: request.title }]}
          center={[request.latitude, request.longitude]}
          zoom={12}
          height="16rem"
        />
      </div>

      {isOwner ? (
        <div className="mt-8">
          <Link href={`/site-radar/${request.id}/responses`} className="text-gold-400 hover:underline">
            {t("siteRadar.detail.viewResponses", { count: request.responseCount })}
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          {!authLoading && !user && <p className="text-sm text-silver-500">{t("siteRadar.detail.loginRequired")}</p>}
          {user && status !== "done" && (
            <div className="space-y-3">
              <textarea
                placeholder={t("siteRadar.detail.messagePlaceholder")}
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-silver-200 placeholder:text-silver-500 focus:border-gold-500 focus:outline-none"
              />
              <button
                onClick={handleRespond}
                disabled={status === "submitting"}
                className="rounded-md bg-gold-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
              >
                {status === "submitting" ? t("siteRadar.detail.sending") : t("siteRadar.detail.respond")}
              </button>
            </div>
          )}
          {status === "done" && <p className="text-sm text-green-400">{t("siteRadar.detail.sent")}</p>}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
