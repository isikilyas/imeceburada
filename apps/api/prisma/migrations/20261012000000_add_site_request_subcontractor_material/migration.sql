-- AlterEnum
ALTER TYPE "SiteRequestType" ADD VALUE 'SUBCONTRACTOR';
ALTER TYPE "SiteRequestType" ADD VALUE 'MATERIAL';

-- AlterTable
ALTER TABLE "site_requests" ADD COLUMN "materialCategory" TEXT;
