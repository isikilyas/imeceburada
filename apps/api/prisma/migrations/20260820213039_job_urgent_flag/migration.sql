-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "job_postings_isUrgent_idx" ON "job_postings"("isUrgent");
