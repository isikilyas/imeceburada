-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN "notifyByEmail" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN "notifyByEmail" BOOLEAN NOT NULL DEFAULT true;
