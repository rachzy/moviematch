-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationSentAt" TIMESTAMP(3);

-- Usuários antigos (sem verificação pendente) passam a contar como verificados.
UPDATE "User" SET "emailVerifiedAt" = now()
WHERE "emailVerifiedAt" IS NULL AND "verificationToken" IS NULL AND "tokenExpiresAt" IS NULL;
