-- AlterTable
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN "companyEmail" TEXT;
ALTER TABLE "company_profiles" ADD COLUMN "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN "companyEmail" TEXT;
ALTER TABLE "supplier_profiles" ADD COLUMN "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "subcontractor_profiles" ADD COLUMN "companyEmail" TEXT;
ALTER TABLE "subcontractor_profiles" ADD COLUMN "logoUrl" TEXT;
