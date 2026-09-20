-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN "machineSpecialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
