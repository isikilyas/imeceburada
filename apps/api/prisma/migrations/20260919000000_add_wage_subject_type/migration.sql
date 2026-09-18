-- CreateEnum
CREATE TYPE "WageSubjectType" AS ENUM ('INDIVIDUAL', 'TEAM', 'EQUIPMENT');

-- DropIndex (old dedup constraint, replaced below)
DROP INDEX "wage_submissions_phone_tradeCategory_city_experienceLevel_key";

-- AlterTable
ALTER TABLE "wage_submissions"
  ADD COLUMN "subjectType" "WageSubjectType" NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN "teamSize" INTEGER,
  ADD COLUMN "equipmentType" TEXT,
  ALTER COLUMN "tradeCategory" DROP NOT NULL,
  ALTER COLUMN "experienceLevel" DROP NOT NULL;

-- CreateIndex (new dedup constraint, includes subjectType/equipmentType)
CREATE UNIQUE INDEX "wage_submissions_dedup_key"
  ON "wage_submissions"("phone", "subjectType", "tradeCategory", "equipmentType", "city", "experienceLevel", "submissionMonth");
