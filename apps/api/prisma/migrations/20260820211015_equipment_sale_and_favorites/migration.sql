-- CreateEnum
CREATE TYPE "EquipmentListingType" AS ENUM ('RENT', 'SALE');

-- CreateEnum
CREATE TYPE "FavoriteListingType" AS ENUM ('JOB', 'EQUIPMENT', 'MATERIAL_LISTING', 'SITE_REQUEST');

-- AlterEnum
ALTER TYPE "EquipmentStatus" ADD VALUE 'SOLD';

-- AlterTable
ALTER TABLE "equipment_listings" ADD COLUMN     "listingType" "EquipmentListingType" NOT NULL DEFAULT 'RENT',
ADD COLUMN     "salePrice" INTEGER;

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingType" "FavoriteListingType" NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_listingType_listingId_key" ON "favorites"("userId", "listingType", "listingId");

-- CreateIndex
CREATE INDEX "equipment_listings_listingType_idx" ON "equipment_listings"("listingType");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
