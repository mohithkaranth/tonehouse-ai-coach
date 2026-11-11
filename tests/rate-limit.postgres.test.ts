import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)("API rate limits on PostgreSQL", () => {
  let prisma: typeof import("@/lib/prisma").prisma;

  beforeAll(async () => {
    vi.stubEnv("DATABASE_URL", databaseUrl);
    ({ prisma } = await import("@/lib/prisma"));
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    vi.unstubAllEnvs();
  });

  it("caps parallel requests atomically, separates scopes and resets in the next hour", async () => {
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-11-11T02:01:00Z").getTime());
    const { checkRateLimit } = await import("@/lib/api-rate-limit");
    const email = `rate-limit-${randomUUID()}@example.com`;
    const hash = createHash("sha256").update(email).digest("hex");

    try {
      const results = await Promise.all(Array.from({ length: 16 }, () => checkRateLimit(email, "coach")));
      expect(results.filter((response) => response === undefined)).toHaveLength(10);
      expect(results.filter((response) => response?.status === 429)).toHaveLength(6);
      expect(results.find(Boolean)?.headers.get("retry-after")).toBe("3540");
      expect(await checkRateLimit(email, "youtube")).toBeUndefined();

      vi.mocked(Date.now).mockReturnValue(new Date("2026-11-11T03:01:00Z").getTime());
      expect(await checkRateLimit(email, "coach")).toBeUndefined();
      const newWindow = await prisma.apiRateLimit.findUniqueOrThrow({ where: { key: `coach:${hash}` } });
      expect(newWindow.count).toBe(1);
    } finally {
      vi.restoreAllMocks();
      await prisma.apiRateLimit.deleteMany({ where: { key: { in: [`coach:${hash}`, `youtube:${hash}`] } } });
    }
  });

  it("serializes billing operations for the same account across database connections", async () => {
    const { withBillingLock } = await import("@/lib/stripe-billing");
    const userId = randomUUID();
    const order: string[] = [];
    const held = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const first = withBillingLock(userId, async () => {
      order.push("first started");
      held.resolve();
      await release.promise;
      order.push("first released");
    });

    await Promise.race([first, held.promise]);
    let secondCanTakeLock: boolean | undefined;
    try {
      const probe = await prisma.$queryRaw<{ acquired: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(12736, hashtext(${userId})) AS acquired
      `;
      secondCanTakeLock = probe[0]?.acquired;
    } finally {
      release.resolve();
      await first;
    }

    expect(secondCanTakeLock).toBe(false);
    await withBillingLock(userId, async () => { order.push("second started"); });
    expect(order).toEqual(["first started", "first released", "second started"]);
  });

});
