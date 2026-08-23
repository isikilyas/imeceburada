-- CreateEnum
CREATE TYPE "CorporateProjectStatus" AS ENUM ('ONGOING', 'COMPLETED');

-- CreateTable
CREATE TABLE "corporate_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CorporateProjectStatus" NOT NULL,
    "city" TEXT NOT NULL,
    "year" INTEGER,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "corporate_projects_status_displayOrder_idx" ON "corporate_projects"("status", "displayOrder");
