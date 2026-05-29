-- CreateTable
CREATE TABLE "StaffLoginRateLimit" (
    "key" TEXT NOT NULL,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "firstFailedAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffLoginRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "StaffLoginRateLimit_blockedUntil_idx" ON "StaffLoginRateLimit"("blockedUntil");

-- CreateIndex
CREATE INDEX "StaffLoginRateLimit_updatedAt_idx" ON "StaffLoginRateLimit"("updatedAt");
