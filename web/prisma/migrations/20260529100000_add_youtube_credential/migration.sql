-- CreateTable
CREATE TABLE "YouTubeCredential" (
    "id" TEXT NOT NULL,
    "refreshTokenEncrypted" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeCredential_pkey" PRIMARY KEY ("id")
);
