-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('NONE', 'PENDING', 'ACTIVE', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryTradeCategory" TEXT;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "membershipExpiresAt" TIMESTAMP(3),
ADD COLUMN     "membershipStatus" "MembershipStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerificationCode" TEXT,
ADD COLUMN     "phoneVerificationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "membership_subscriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "plan" "MembershipPlan" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "iyzicoPricingPlanReferenceCode" TEXT,
    "iyzicoSubscriptionReferenceCode" TEXT,
    "checkoutToken" TEXT,
    "startedAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membership_subscriptions_companyId_status_idx" ON "membership_subscriptions"("companyId", "status");

-- CreateIndex
CREATE INDEX "candidate_profiles_isPublic_primaryTradeCategory_city_idx" ON "candidate_profiles"("isPublic", "primaryTradeCategory", "city");

-- AddForeignKey
ALTER TABLE "membership_subscriptions" ADD CONSTRAINT "membership_subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
