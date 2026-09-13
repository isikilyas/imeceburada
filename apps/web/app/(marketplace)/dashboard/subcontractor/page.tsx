"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Taşeron firma panelinin tamamı (profil, gizlilik, üyelik) artık Hesabım
 * panelinde — bu rota geriye dönük eski linkler için /account'a yönlendirir.
 */
export default function SubcontractorDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account");
  }, [router]);

  return null;
}
