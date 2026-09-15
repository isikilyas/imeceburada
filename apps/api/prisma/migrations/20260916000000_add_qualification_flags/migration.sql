-- AlterTable
ALTER TABLE "candidate_profiles"
  ADD COLUMN "hasProfessionalQualificationCert" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "hasMasterCraftsmanCert" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "hasOshCert" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "company_profiles"
  ADD COLUMN "hasActivityCertificate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "supplier_profiles"
  ADD COLUMN "hasActivityCertificate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subcontractor_profiles"
  ADD COLUMN "hasActivityCertificate" BOOLEAN NOT NULL DEFAULT false;
