-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUBCONTRACTOR';

-- DropIndex
DROP INDEX "candidate_profiles_isPublic_primaryTradeCategory_city_idx";

-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "equipment_listings" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "material_listings" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "material_price_submissions" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "membership_subscriptions" ADD COLUMN     "subcontractorId" TEXT;

-- AlterTable
ALTER TABLE "site_requests" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "wage_submissions" ADD COLUMN     "district" TEXT;

-- CreateTable
CREATE TABLE "subcontractor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "primaryTradeCategory" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "phoneVerifiedAt" TIMESTAMP(3),
    "phoneVerificationCode" TEXT,
    "phoneVerificationExpiresAt" TIMESTAMP(3),
    "membershipStatus" "MembershipStatus" NOT NULL DEFAULT 'NONE',
    "membershipExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcontractor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subcontractor_profiles_userId_key" ON "subcontractor_profiles"("userId");

-- CreateIndex
CREATE INDEX "subcontractor_profiles_isPublic_primaryTradeCategory_city_d_idx" ON "subcontractor_profiles"("isPublic", "primaryTradeCategory", "city", "district");

-- CreateIndex
CREATE INDEX "candidate_profiles_isPublic_primaryTradeCategory_city_distr_idx" ON "candidate_profiles"("isPublic", "primaryTradeCategory", "city", "district");

-- CreateIndex
CREATE INDEX "membership_subscriptions_subcontractorId_status_idx" ON "membership_subscriptions"("subcontractorId", "status");

-- AddForeignKey
ALTER TABLE "subcontractor_profiles" ADD CONSTRAINT "subcontractor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_subscriptions" ADD CONSTRAINT "membership_subscriptions_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "subcontractor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
