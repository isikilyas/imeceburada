-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN "phoneVisible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN "phoneVisible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN "phoneVisible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subcontractor_profiles" ADD COLUMN "phoneVisible" BOOLEAN NOT NULL DEFAULT false;
