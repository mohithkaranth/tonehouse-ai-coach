-- CreateTable
CREATE TABLE "BetaUser" (
    "id" TEXT NOT NULL,
    "googleSubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetaUser_googleSubId_key" ON "BetaUser"("googleSubId");
