"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function MembershipCallbackContent() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      {status === "checking" && <p className="text-silver-500">Ödeme sonucu kontrol ediliyor...</p>}
      {status === "active" && <p className="text-green-400">Üyeliğin aktifleşti! Yönlendiriliyorsun...</p>}
      {status === "pending" && (
        <p className="text-silver-300">Ödemen alındı, üyeliğin birazdan aktifleşecek. Yönlendiriliyorsun...</p>
      )}
      {status === "error" && (
        <p className="text-red-400">Ödeme sonucu doğrulanamadı. Üyelik sayfasından durumu tekrar kontrol et.</p>
      )}
    </div>
  );
}

export default function MembershipCallbackPage() {
  return (
    <Suspense fallback={<p className="text-silver-500">Yükleniyor...</p>}>
      <MembershipCallbackContent />
    </Suspense>
  );
}