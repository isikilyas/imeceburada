export type UserRole = "CANDIDATE" | "COMPANY" | "SUPPLIER" | "SUBCONTRACTOR" | "ADMIN";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "DAILY" | "CONTRACT";

export type JobStatus = "ACTIVE" | "CLOSED";

export type ApplicationStatus = "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";

export type WagePeriod = "DAILY" | "MONTHLY" | "HOURLY";

/** Bir fiyat/ücret gönderiminin gerçekten ödenen bir tutarı mı yoksa bir teklif/beklentiyi mi yansıttığı. */
export type PriceSubmissionType = "ACTUAL" | "OFFER";

export const PRICE_SUBMISSION_TYPES: { value: PriceSubmissionType; label: string }[] = [
  { value: "ACTUAL", label: "Gerçekleşen / Ödenen" },
  { value: "OFFER", label: "Teklif / Beklenti" },
];

export type ExperienceLevel = "JUNIOR" | "MID" | "SENIOR";

/** Adayın şu an iş kabul edip etmediği — dizinde ve WhatsApp iletişim butonunda kullanılır. */
export type AvailabilityStatus = "AVAILABLE" | "BUSY";

export const AVAILABILITY_STATUSES: { value: AvailabilityStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Müsaitim" },
  { value: "BUSY", label: "Şu An Çalışıyorum" },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "JUNIOR", label: "0-2 yıl" },
  { value: "MID", label: "3-6 yıl" },
  { value: "SENIOR", label: "7+ yıl" },
];

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Tam Zamanlı" },
  { value: "PART_TIME", label: "Yarı Zamanlı" },
  { value: "DAILY", label: "Yevmiyeli" },
  { value: "CONTRACT", label: "Sözleşmeli / Proje Bazlı" },
];

export const WAGE_PERIODS: { value: WagePeriod; label: string }[] = [
  { value: "DAILY", label: "Günlük" },
  { value: "MONTHLY", label: "Aylık" },
  { value: "HOURLY", label: "Saatlik" },
];

export type EquipmentStatus = "AVAILABLE" | "RENTED" | "SOLD" | "INACTIVE";

export const EQUIPMENT_STATUSES: { value: EquipmentStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Müsait" },
  { value: "RENTED", label: "Kirada" },
  { value: "SOLD", label: "Satıldı" },
  { value: "INACTIVE", label: "Pasif" },
];

/** Ekipman ilanının kiralık mı yoksa satılık mı olduğu — fiyat alanları ve durum etiketleri buna göre değişir. */
export type EquipmentListingType = "RENT" | "SALE";

export const EQUIPMENT_LISTING_TYPES: { value: EquipmentListingType; label: string }[] = [
  { value: "RENT", label: "Kiralık" },
  { value: "SALE", label: "Satılık" },
];

export type SiteRequestType = "WORKER" | "EQUIPMENT";

export const SITE_REQUEST_TYPES: { value: SiteRequestType; label: string }[] = [
  { value: "WORKER", label: "Usta / İşçi" },
  { value: "EQUIPMENT", label: "İş Makinesi" },
];

export type SiteRequestStatus = "OPEN" | "CLOSED";

export type SiteRequestResponseStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type WorkPreference =
  | "DAILY"
  | "DAY_WAGE"
  | "MONTHLY"
  | "PERMANENT"
  | "PROJECT_BASED"
  | "TEMPORARY"
  | "TEAM";

/** İş arayan personelin birden fazla seçebileceği çalışma şekli tercihleri. */
export const WORK_PREFERENCES: { value: WorkPreference; label: string }[] = [
  { value: "DAILY", label: "Günlük iş arıyorum" },
  { value: "DAY_WAGE", label: "Yevmiyeli iş arıyorum" },
  { value: "MONTHLY", label: "Aylık iş arıyorum" },
  { value: "PERMANENT", label: "Sürekli iş arıyorum" },
  { value: "PROJECT_BASED", label: "Proje bazlı iş arıyorum" },
  { value: "TEMPORARY", label: "Geçici iş arıyorum" },
  { value: "TEAM", label: "Ekip olarak iş arıyorum" },
];

export const WORK_PREFERENCE_VALUES = WORK_PREFERENCES.map((w) => w.value) as [string, ...string[]];

export type ListingIntent =
  | "PERSONNEL"
  | "TEAM"
  | "SUBCONTRACTOR"
  | "SUB_SUBCONTRACTOR"
  | "SPECIALIST_FIRM"
  | "SERVICE";

/** Firma ilan oluştururken "Ne arıyorsunuz?" sorusuna verdiği cevap. */
export const LISTING_INTENTS: { value: ListingIntent; label: string }[] = [
  { value: "PERSONNEL", label: "Personel Arıyorum" },
  { value: "TEAM", label: "Ekip Arıyorum" },
  { value: "SUBCONTRACTOR", label: "Taşeron Firma Arıyorum" },
  { value: "SUB_SUBCONTRACTOR", label: "Alt Taşeron Arıyorum" },
  { value: "SPECIALIST_FIRM", label: "Uzman Firma Arıyorum" },
  { value: "SERVICE", label: "Hizmet Arıyorum" },
];

export const LISTING_INTENT_VALUES = LISTING_INTENTS.map((l) => l.value) as [string, ...string[]];
