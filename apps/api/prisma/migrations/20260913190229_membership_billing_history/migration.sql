-- AlterTable
ALTER TABLE "membership_subscriptions" ADD COLUMN "planLabel" TEXT;
ALTER TABLE "membership_subscriptions" ADD COLUMN "planPriceLabel" TEXT;
ALTER TABLE "membership_subscriptions" ADD COLUMN "identityNumber" TEXT;
ALTER TABLE "membership_subscriptions" ADD COLUMN "billingContactName" TEXT;
ALTER TABLE "membership_subscriptions" ADD COLUMN "billingCity" TEXT;
ALTER TABLE "membership_subscriptions" ADD COLUMN "billingAddress" TEXT;
ALTER TABLE "membership_subscriptions" ADD COLUMN "billingZipCode" TEXT;
