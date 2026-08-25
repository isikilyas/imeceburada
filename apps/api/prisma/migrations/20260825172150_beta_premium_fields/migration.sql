-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "currentPlan" "MembershipPlan",
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subcontractor_profiles" ADD COLUMN     "currentPlan" "MembershipPlan",
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN     "currentPlan" "MembershipPlan",
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

