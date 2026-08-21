-- CreateEnum
CREATE TYPE "PriceSubmissionType" AS ENUM ('ACTUAL', 'OFFER');

-- AlterTable
ALTER TABLE "material_price_submissions" ADD COLUMN     "submissionType" "PriceSubmissionType" NOT NULL DEFAULT 'ACTUAL';

-- AlterTable
ALTER TABLE "wage_submissions" ADD COLUMN     "submissionType" "PriceSubmissionType" NOT NULL DEFAULT 'ACTUAL';
