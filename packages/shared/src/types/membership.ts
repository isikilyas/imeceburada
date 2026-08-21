export type MembershipStatus = "NONE" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED";

export type MembershipPlan = "MONTHLY" | "YEARLY";

export interface MembershipPlanInfo {
  plan: MembershipPlan;
  label: string;
  priceLabel: string;
}

/** Gösterim amaçlı — gerçek fiyat/plan Iyzico panelinde tanımlanır. */
export const MEMBERSHIP_PLANS: MembershipPlanInfo[] = [
  { plan: "MONTHLY", label: "Aylık", priceLabel: "499 ₺ / ay" },
  { plan: "YEARLY", label: "Yıllık", priceLabel: "4.990 ₺ / yıl (2 ay bedava)" },
];

export interface CompanyMembershipDto {
  status: MembershipStatus;
  plan?: MembershipPlan | null;
  expiresAt?: string | null;
  phoneVerified: boolean;
}

export interface InitiateCheckoutInput {
  plan: MembershipPlan;
}

export interface InitiateCheckoutResponse {
  checkoutFormContent: string;
  token: string;
}

export interface SendPhoneCodeInput {
  phone: string;
}

export interface VerifyPhoneCodeInput {
  code: string;
}