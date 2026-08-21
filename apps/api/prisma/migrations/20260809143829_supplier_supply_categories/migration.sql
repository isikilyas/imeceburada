-- AlterTable
ALTER TABLE "subcontractor_profiles" ALTER COLUMN "tradeCategories" DROP DEFAULT;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN     "supplyCategories" TEXT[];
