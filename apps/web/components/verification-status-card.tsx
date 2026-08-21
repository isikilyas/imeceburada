import Link from "next/link";

interface VerificationStatusCardProps {
  phoneVerified: boolean;
  membershipStatus: string;
  membershipExpiresAt?: string | null;
}

/** Firma/tedarikçi/taşeron panellerinde ortak "hesap durumu" kartı — telefon
 * doğrulama ve üyelik durumunu tek bakışta gösterir. */
export function VerificationStatusCard({
  phoneVerified,
  membershipStatus,
  membershipExpiresAt,
}: VerificationStatusCardProps) {
  const isActive = membershipStatus === "ACTIVE";

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <p className="mb-3 text-sm font-medium text-silver-300">Hesap Durumu</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-silver-500">Telefon Doğrulama</span>
          <span className={phoneVerified ? "text-green-400" : "text-red-400"}>
            {phoneVerified ? "✓ Doğrulandı" : "✗ Doğrulanmadı"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-silver-500">Üyelik</span>
          <span className={isActive ? "text-green-400" : "text-red-400"}>{isActive ? "✓ Aktif" : "✗ Pasif"}</span>
        </div>
        {isActive && membershipExpiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-silver-500">Bitiş Tarihi</span>
            <span className="text-silver-400">{new Date(membershipExpiresAt).toLocaleDateString("tr-TR")}</span>
          </div>
        )}
      </div>
      {!isActive && (
        <Link
          href="/membership"
          className="mt-3 block rounded-md bg-gold-500 py-2 text-center text-sm font-medium text-ink-950 hover:bg-gold-400"
        >
          Üyeliği Etkinleştir
        </Link>
      )}
    </div>
  );
}