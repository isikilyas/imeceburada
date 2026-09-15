"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationDto, MessageDto } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import { inputClass } from "@/components/form";
import { FormSkeleton } from "@/components/form-skeleton";
import { ReviewsSection } from "@/components/reviews-section";

export default function MessageThreadPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: thread, isLoading } = useQuery({
    queryKey: ["message-thread", applicationId],
    queryFn: () => authFetch<MessageDto[]>(`/applications/${applicationId}/messages`),
    enabled: !!applicationId && (user?.role === "CANDIDATE" || user?.role === "COMPANY"),
    refetchInterval: 5000,
  });

  const { data: application } = useQuery({
    queryKey: ["application-detail", applicationId],
    queryFn: () => authFetch<ApplicationDto>(`/applications/${applicationId}`),
    enabled: !!applicationId && (user?.role === "CANDIDATE" || user?.role === "COMPANY"),
  });

  useEffect(() => {
    if (!applicationId || !user) return;
    authFetch(`/applications/${applicationId}/messages/read`, { method: "POST" })
      .then(() => queryClient.invalidateQueries({ queryKey: ["my-conversations"] }))
      .catch(() => undefined);
  }, [applicationId, user, authFetch, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setError(null);
    setIsSending(true);
    try {
      await authFetch(`/applications/${applicationId}/messages`, { method: "POST", body: JSON.stringify({ body }) });
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["message-thread", applicationId] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("messages.sendFailed"));
    } finally {
      setIsSending(false);
    }
  }

  if (authLoading) return <FormSkeleton rows={5} />;
  if (!user || (user.role !== "CANDIDATE" && user.role !== "COMPANY")) {
    return <p className="text-silver-500">Bu sayfa sadece bireysel ve firma hesapları içindir.</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col space-y-4">
      <Link href="/messages" className="text-sm text-gold-400 hover:underline">
        {t("messages.backLink")}
      </Link>

      {isLoading ? (
        <FormSkeleton rows={5} />
      ) : (
        <>
          <div className="flex-1 space-y-3 rounded-lg border border-ink-800 bg-ink-900 p-4">
            {thread?.length === 0 && <p className="text-sm text-silver-500">{t("messages.noMessagesInThread")}</p>}
            {thread?.map((m) => (
              <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    m.isMine ? "bg-gold-500 text-ink-950" : "border border-ink-700 text-silver-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-xs ${m.isMine ? "text-ink-800" : "text-silver-500"}`}>
                    {new Date(m.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("messages.placeholder")}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="shrink-0 rounded-md bg-gold-500 px-4 py-2 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
            >
              {isSending ? t("messages.sendingButton") : t("messages.sendButton")}
            </button>
          </form>
          {error && <p className="text-sm text-red-400">{error}</p>}

          {application?.status === "ACCEPTED" && <ReviewsSection applicationId={applicationId} />}
        </>
      )}
    </div>
  );
}
