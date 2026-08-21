-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "workPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[];
