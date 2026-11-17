-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;
