"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ConversationSummaryDto } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { ListSkeleton } from "@/components/list-skeleton";

export default function MessagesPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["my-conversations"],
    queryFn: () => authFetch<ConversationSummaryDto[]>("/conversations"),
    enabled: user?.role === "CANDIDATE" || user?.role === "COMPANY",
  });

  if (authLoading) return <p className="text-silver-500">{t("common.loading")}</p>;
  if (!user)
    return (
      <p className="text-silver-500">
        {t("favorites.loginRequired")}{" "}
        <Link href="/login" className="text-gold-400 hover:underline">
          {t("auth.loginButton")}
        </Link>
      </p>
    );
  if (user.role !== "CANDIDATE" && user.role !== "COMPANY") {
    return <p className="text-silver-500">Bu sayfa sadece bireysel ve firma hesapları içindir.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-silver-300">{t("messages.title")}</h1>
        <p className="mt-1 text-sm text-silver-500">{t("messages.hint")}</p>
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : conversations?.length === 0 ? (
        <p className="text-silver-500">{t("messages.empty")}</p>
      ) : (
        <div className="space-y-2">
          {conversations?.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.applicationId}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
            >
              <div className="min-w-0">
                <p className="font-medium text-silver-200">
                  {user.role === "CANDIDATE" ? c.companyName : c.candidateName}
                </p>
                <p className="text-xs text-silver-500">{c.jobTitle}</p>
                {c.lastMessageBody && (
                  <p className="mt-1 truncate text-sm text-silver-400">{c.lastMessageBody}</p>
                )}
              </div>
              {c.unreadCount > 0 && (
                <span className="shrink-0 rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-ink-950">
                  {t("messages.unreadBadge", { count: c.unreadCount })}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
