-- CreateEnum
CREATE TYPE "TaxonomyTermType" AS ENUM ('TRADE_PROFESSION', 'MATERIAL_TYPE', 'MATERIAL_CATEGORY_ITEM', 'EQUIPMENT_TYPE');

-- CreateEnum
CREATE TYPE "TaxonomyTermStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "taxonomy_terms" (
    "id" TEXT NOT NULL,
    "type" "TaxonomyTermType" NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "TaxonomyTermStatus" NOT NULL DEFAULT 'PENDING',
    "submittedByUserId" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taxonomy_terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "taxonomy_terms_type_status_idx" ON "taxonomy_terms"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_terms_type_normalizedValue_key" ON "taxonomy_terms"("type", "normalizedValue");

-- AddForeignKey
ALTER TABLE "taxonomy_terms" ADD CONSTRAINT "taxonomy_terms_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxonomy_terms" ADD CONSTRAINT "taxonomy_terms_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
