-- AlterTable
ALTER TABLE "users" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "pendingEmail" TEXT;
ALTER TABLE "users" ADD COLUMN "emailChangeCode" TEXT;
ALTER TABLE "users" ADD COLUMN "emailChangeExpiresAt" TIMESTAMP(3);
