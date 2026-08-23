"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";

function MembershipCallbackContent() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [status, setStatus] = useState<"checking" | "active" | "pending" | "error">("checking");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    authFetch<{ status: string }>(`/membership/callback?token=${encodeURIComponent(token)}`, { method: "POST" })
      .then((res) => {
        setStatus(res.status === "ACTIVE" ? "active" : "pending");
        setTimeout(() => router.push("/membership"), 2500);
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "checking" && <p className="text-silver-500">{t("misc.membershipCallback.checking")}</p>}
      {status === "active" && <p className="text-green-400">{t("misc.membershipCallback.active")}</p>}
      {status === "pending" && (
        <p className="text-silver-300">{t("misc.membershipCallback.pending")}</p>
      )}
      {status === "error" && (
        <p className="text-red-400">{t("misc.membershipCallback.error")}</p>
      )}
    </div>
  );
}

export default function MembershipCallbackPage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<p className="text-silver-500">{t("common.loading")}</p>}>
      <MembershipCallbackContent />
    </Suspense>
  );
}