import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function checkRateLimit(email: string, scope: "coach" | "youtube") {
  const limit = scope === "coach" ? 10 : 20;
  const windowMs = 60 * 60 * 1000;
  const now = Date.now();
  const windowStart = new Date(now - now % windowMs);
  const key = scope + ":" + createHash("sha256").update(email.toLowerCase()).digest("hex");

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "ApiRateLimit" ("key", "windowStart", "count")
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT ("key") DO UPDATE SET
      "windowStart" = EXCLUDED."windowStart",
      "count" = CASE
        WHEN "ApiRateLimit"."windowStart" = EXCLUDED."windowStart" THEN "ApiRateLimit"."count" + 1
        ELSE 1
      END
    WHERE "ApiRateLimit"."windowStart" < EXCLUDED."windowStart"
      OR ("ApiRateLimit"."windowStart" = EXCLUDED."windowStart" AND "ApiRateLimit"."count" < ${limit})
    RETURNING "count"
  `;

  if (!rows.length) {
    return NextResponse.json(
      { error: "You’ve reached the hourly limit. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((+windowStart + windowMs - now) / 1000))) } },
    );
  }
}
