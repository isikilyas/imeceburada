-- AlterTable: applications — candidateId now optional, add subcontractorId
ALTER TABLE "applications"
  ALTER COLUMN "candidateId" DROP NOT NULL,
  ADD COLUMN "subcontractorId" TEXT;

ALTER TABLE "applications"
  ADD CONSTRAINT "applications_subcontractorId_fkey"
  FOREIGN KEY ("subcontractorId") REFERENCES "subcontractor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "applications_jobId_subcontractorId_key" ON "applications"("jobId", "subcontractorId");

-- AlterTable: conversations — candidateId now optional, add subcontractorId
ALTER TABLE "conversations"
  ALTER COLUMN "candidateId" DROP NOT NULL,
  ADD COLUMN "subcontractorId" TEXT;

ALTER TABLE "conversations"
  ADD CONSTRAINT "conversations_subcontractorId_fkey"
  FOREIGN KEY ("subcontractorId") REFERENCES "subcontractor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "conversations_subcontractorId_idx" ON "conversations"("subcontractorId");
