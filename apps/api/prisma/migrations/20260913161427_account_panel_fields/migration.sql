-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN "address" TEXT;
ALTER TABLE "candidate_profiles" ADD COLUMN "bio" TEXT;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN "address" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "description" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "authorizedPersonName" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "taxOffice" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "mersisNumber" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "website" TEXT;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN "address" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "description" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "authorizedPersonName" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "taxOffice" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "mersisNumber" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "website" TEXT;

-- AlterTable
ALTER TABLE "subcontractor_profiles" ADD COLUMN "address" TEXT;
ALTER TABLE "subcontractor_profiles" ADD COLUMN "authorizedPersonName" TEXT;
ALTER TABLE "subcontractor_profiles" ADD COLUMN "taxOffice" TEXT;
ALTER TABLE "subcontractor_profiles" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "subcontractor_profiles" ADD COLUMN "mersisNumber" TEXT;
ALTER TABLE "subcontractor_profiles" ADD COLUMN "website" TEXT;
