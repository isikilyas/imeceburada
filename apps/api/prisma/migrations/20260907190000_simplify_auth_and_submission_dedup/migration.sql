-- DropForeignKey
ALTER TABLE "phone_login_codes" DROP CONSTRAINT IF EXISTS "phone_login_codes_userId_fkey";

-- DropTable (no longer used — registration/login verification codes removed)
DROP TABLE IF EXISTS "phone_login_codes";
DROP TABLE IF EXISTS "registration_phone_codes";
DROP TABLE IF EXISTS "registration_email_codes";

-- AlterTable: wage_submissions gets phone + submissionMonth for the
-- "one entry per phone per profession/city/month" market-integrity rule.
-- Existing rows (if any) are backfilled with a unique placeholder (their own
-- id) for phone so the new unique index below can never collide with them.
ALTER TABLE "wage_submissions" ADD COLUMN "phone" TEXT;
UPDATE "wage_submissions" SET "phone" = "id" WHERE "phone" IS NULL;
ALTER TABLE "wage_submissions" ALTER COLUMN "phone" SET NOT NULL;

ALTER TABLE "wage_submissions" ADD COLUMN "submissionMonth" TEXT;
UPDATE "wage_submissions" SET "submissionMonth" = to_char("createdAt", 'YYYY-MM') WHERE "submissionMonth" IS NULL;
ALTER TABLE "wage_submissions" ALTER COLUMN "submissionMonth" SET NOT NULL;

CREATE UNIQUE INDEX "wage_submissions_phone_tradeCategory_city_experienceLevel_key"
  ON "wage_submissions"("phone", "tradeCategory", "city", "experienceLevel", "submissionMonth");

-- AlterTable: material_price_submissions gets the same phone + submissionMonth pair.
ALTER TABLE "material_price_submissions" ADD COLUMN "phone" TEXT;
UPDATE "material_price_submissions" SET "phone" = "id" WHERE "phone" IS NULL;
ALTER TABLE "material_price_submissions" ALTER COLUMN "phone" SET NOT NULL;

ALTER TABLE "material_price_submissions" ADD COLUMN "submissionMonth" TEXT;
UPDATE "material_price_submissions" SET "submissionMonth" = to_char("createdAt", 'YYYY-MM') WHERE "submissionMonth" IS NULL;
ALTER TABLE "material_price_submissions" ALTER COLUMN "submissionMonth" SET NOT NULL;

CREATE UNIQUE INDEX "material_price_submissions_phone_materialType_city_submis_key"
  ON "material_price_submissions"("phone", "materialType", "city", "submissionMonth");
