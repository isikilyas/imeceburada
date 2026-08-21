-- DropIndex
DROP INDEX "subcontractor_profiles_isPublic_primaryTradeCategory_city_d_idx";

-- AlterTable: add the new array column, backfill from the old single-value column, then drop it
ALTER TABLE "subcontractor_profiles" ADD COLUMN "tradeCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "subcontractor_profiles"
SET "tradeCategories" = ARRAY["primaryTradeCategory"]
WHERE "primaryTradeCategory" IS NOT NULL;

ALTER TABLE "subcontractor_profiles" DROP COLUMN "primaryTradeCategory";

-- CreateIndex
CREATE INDEX "subcontractor_profiles_isPublic_city_district_idx" ON "subcontractor_profiles"("isPublic", "city", "district");