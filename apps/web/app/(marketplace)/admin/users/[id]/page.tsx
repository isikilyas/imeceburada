"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { FormSkeleton } from "@/components/form-skeleton";

interface CorporateProfileDetail {
  id: string;
  companyName: string;
  phone: string | null;
  phoneVisible: boolean;
  phoneVerifiedAt: string | null;
  city: string;
  district: string | null;
  address: string | null;
  website: string | null;
  companyEmail: string | null;
  logoUrl: string | null;
  authorizedPersonName: string | null;
  taxOffice: string | null;
  taxNumber: string | null;
  mersisNumber: string | null;
  membershipStatus: string;
  membershipExpiresAt: string | null;
  isPremium: boolean;
  currentPlan: string | null;
  isPublic?: boolean;
  supplyCategories?: string[];
  tradeCategories?: string[];
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminUserDetail {
  id: string;
  email: string;
  username: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  deactivatedAt: string | null;
  pendingEmail: string | null;
  candidateProfile: {
    id: string;
    fullName: string;
    phone: string | null;
    phoneVisible: boolean;
    phoneVerifiedAt: string | null;
    city: string;
    district: string | null;
    address: string | null;
    bio: string | null;
    experienceYears: number;
    skills: string[];
    workPreferences: string[];
    primaryTradeCategory: string | null;
    isPublic: boolean;
    photoUrl: string | null;
    photoVisible: boolean;
    availabilityStatus: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  companyProfile: CorporateProfileDetail | null;
  supplierProfile: CorporateProfileDetail | null;
  subcontractorProfile: CorporateProfileDetail | null;
}

const ROLE_LABELS: Record<string, string> = {
  CANDIDATE: "Bireysel",
  COMPANY: "Firma",
  SUPPLIER: "Yapı Tedarik",
  SUBCONTRACTOR: "Taşeron",
  ADMIN: "Yönetici",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-800 py-2 text-sm last:border-0">
      <span className="text-silver-500">{label}</span>
      <span className="text-right text-silver-200">{value ?? "—"}</span>
    </div>
  );
}

function CorporateSection({ title, profile }: { title: string; profile: CorporateProfileDetail }) {
  return (
    <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="mb-2 text-sm font-semibold text-silver-300">{title}</h2>
      <Row label="Firma Adı" value={profile.companyName} />
      <Row label="Yetkili Kişi" value={profile.authorizedPersonName} />
      <Row label="Telefon" value={profile.phone} />
      <Row label="Telefon Doğrulama" value={profile.phoneVerifiedAt ? "Doğrulandı" : "Doğrulanmadı"} />
      <Row label="Firma E-postası" value={profile.companyEmail} />
      <Row label="Şehir / İlçe" value={`${profile.city}${profile.district ? " / " + profile.district : ""}`} />
      <Row label="Adres" value={profile.address} />
      <Row label="Web Sitesi" value={profile.website} />
      <Row label="Vergi Dairesi" value={profile.taxOffice} />
      <Row label="Vergi Numarası" value={profile.taxNumber} />
      <Row label="MERSİS Numarası" value={profile.mersisNumber} />
      {profile.supplyCategories && <Row label="Tedarik Kategorileri" value={profile.supplyCategories.join(", ")} />}
      {profile.tradeCategories && <Row label="Meslekler" value={profile.tradeCategories.join(", ")} />}
      {profile.description !== undefined && <Row label="Açıklama" value={profile.description} />}
      {profile.isPublic !== undefined && <Row label="Dizinde Görünür" value={profile.isPublic ? "Evet" : "Hayır"} />}
      <Row label="Üyelik Durumu" value={profile.membershipStatus} />
      <Row
        label="Üyelik Bitiş"
        value={profile.membershipExpiresAt ? new Date(profile.membershipExpiresAt).toLocaleDateString("tr-TR") : null}
      />
    </section>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, authFetch } = useAuth();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["admin-user-detail", id],
    queryFn: () => authFetch<AdminUserDetail>(`/admin/users/${id}`),
    enabled: user?.role === "ADMIN" && !!id,
  });

  if (authLoading) return <FormSkeleton rows={5} />;
  if (user?.role !== "ADMIN") return <p className="text-silver-500">Bu sayfayı görüntüleme yetkiniz yok.</p>;
  if (isLoading || !detail) return <FormSkeleton rows={5} />;

  const corporate = detail.companyProfile ?? detail.supplierProfile ?? detail.subcontractorProfile;
  const corporateTitle = detail.companyProfile
    ? "Firma Bilgileri"
    : detail.supplierProfile
      ? "Yapı Tedarik Bilgileri"
      : "Taşeron Firma Bilgileri";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-gold-400 hover:underline">
          ← Kullanıcılara dön
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-silver-300">
          {detail.candidateProfile?.fullName ?? corporate?.companyName ?? detail.email}
        </h1>
      </div>

      <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
        <h2 className="mb-2 text-sm font-semibold text-silver-300">Hesap Bilgileri</h2>
        <Row label="E-posta" value={detail.email} />
        {detail.pendingEmail && <Row label="Bekleyen E-posta Değişikliği" value={detail.pendingEmail} />}
        <Row label="Kullanıcı Adı" value={detail.username} />
        <Row label="Rol" value={ROLE_LABELS[detail.role] ?? detail.role} />
        <Row label="Üyelik Tarihi" value={new Date(detail.createdAt).toLocaleDateString("tr-TR")} />
        <Row
          label="Son Giriş"
          value={detail.lastLoginAt ? new Date(detail.lastLoginAt).toLocaleString("tr-TR") : null}
        />
        <Row
          label="Hesap Durumu"
          value={
            detail.deactivatedAt ? (
              <span className="text-red-400">
                Dondurulmuş ({new Date(detail.deactivatedAt).toLocaleDateString("tr-TR")})
              </span>
            ) : (
              <span className="text-green-400">Aktif</span>
            )
          }
        />
      </section>

      {detail.candidateProfile && (
        <section className="rounded-lg border border-ink-800 bg-ink-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-silver-300">Kişisel Bilgiler</h2>
          <Row label="Ad Soyad" value={detail.candidateProfile.fullName} />
          <Row label="Telefon" value={detail.candidateProfile.phone} />
          <Row
            label="Telefon Doğrulama"
            value={detail.candidateProfile.phoneVerifiedAt ? "Doğrulandı" : "Doğrulanmadı"}
          />
          <Row
            label="Şehir / İlçe"
            value={`${detail.candidateProfile.city}${detail.candidateProfile.district ? " / " + detail.candidateProfile.district : ""}`}
          />
          <Row label="Adres" value={detail.candidateProfile.address} />
          <Row label="Meslek" value={detail.candidateProfile.primaryTradeCategory} />
          <Row label="Uzmanlık Alanı" value={detail.candidateProfile.skills.join(", ")} />
          <Row label="Deneyim" value={`${detail.candidateProfile.experienceYears} yıl`} />
          <Row label="Hakkımda" value={detail.candidateProfile.bio} />
          <Row label="Müsaitlik" value={detail.candidateProfile.availabilityStatus} />
          <Row label="Dizinde Görünür" value={detail.candidateProfile.isPublic ? "Evet" : "Hayır"} />
        </section>
      )}

      {corporate && <CorporateSection title={corporateTitle} profile={corporate} />}
    </div>
  );
}
