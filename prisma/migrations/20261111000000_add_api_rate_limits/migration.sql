CREATE TABLE "ApiRateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "windowStart" TIMESTAMPTZ(3) NOT NULL,
    "count" INTEGER NOT NULL
);

CREATE INDEX "ApiRateLimit_windowStart_idx" ON "ApiRateLimit"("windowStart");
