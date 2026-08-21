-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "photoVisible" BOOLEAN NOT NULL DEFAULT true;
