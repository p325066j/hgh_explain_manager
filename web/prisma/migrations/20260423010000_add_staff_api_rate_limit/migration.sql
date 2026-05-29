-- CreateTable
CREATE TABLE "StaffApiRateLimit" (
    "key" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffApiRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "StaffApiRateLimit_blockedUntil_idx" ON "StaffApiRateLimit"("blockedUntil");

-- CreateIndex
CREATE INDEX "StaffApiRateLimit_updatedAt_idx" ON "StaffApiRateLimit"("updatedAt");
