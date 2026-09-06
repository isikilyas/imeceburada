-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "phoneVerificationCode" TEXT,
ADD COLUMN     "phoneVerificationExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "registration_phone_codes" (
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_phone_codes_pkey" PRIMARY KEY ("phone")
);
