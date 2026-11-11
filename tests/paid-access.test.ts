import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  redirect: vi.fn(),
  betaUser: vi.fn(),
  user: vi.fn(),
  rateLimit: vi.fn(),
  generate: vi.fn(),
  search: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({
  prisma: { betaUser: { findUnique: mocks.betaUser }, user: { findUnique: mocks.user } },
}));
vi.mock("@/lib/api-rate-limit", () => ({ checkRateLimit: mocks.rateLimit }));
vi.mock("@/lib/coach-generation", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/coach-generation")>(),
  generatePracticePlan: mocks.generate,
}));
vi.mock("@/lib/youtube", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/youtube")>(),
  searchVideos: mocks.search,
}));

import { POST as coach } from "@/app/api/coach/route";
import { POST as sheet } from "@/app/api/sheet/route";
import { GET as videos } from "@/app/api/youtube-search/route";
import { requirePaidPage } from "@/lib/getUserAccessLevel";

function coachRequest() {
  return new Request("http://localhost/api/coach", {
    method: "POST",
    body: JSON.stringify({ daysPerWeek: 1, timePerDay: "10 minutes" }),
  });
}

describe("paid routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.betaUser.mockResolvedValue(null);
    mocks.user.mockResolvedValue(null);
    mocks.search.mockResolvedValue([]);
    mocks.generate.mockImplementation(async (input) => ({
      ...input,
      focusMetric: "Steady tempo",
      notes: [],
      dayByDay: [{ day: 1, title: "Timing", blocks: [{ name: "Drill", minutes: 10, bullets: ["Count aloud"] }] }],
    }));
    mocks.redirect.mockImplementation((path) => { throw new Error(path); });
  });

  it("redirects signed-out pages and blocks all paid APIs before they call providers", async () => {
    const response = await Promise.all([
      coach(coachRequest()),
      sheet(coachRequest()),
      videos(new Request("http://localhost/api/youtube-search?q=guitar")),
    ]);
    expect(response.map(({ status }) => status)).toEqual([401, 401, 401]);
    await expect(requirePaidPage("/lessons/lesson-001")).rejects.toThrow("/signin?callbackUrl=%2Flessons%2Flesson-001");
    expect(mocks.rateLimit).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.search).not.toHaveBeenCalled();
  });

  it("blocks a signed-in subscriber whose plan has lapsed", async () => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    mocks.user.mockResolvedValue({ subscription: { status: "past_due" } });

    expect((await coach(coachRequest())).status).toBe(403);
    await expect(requirePaidPage("/ear-training")).rejects.toThrow("/billing");
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it.each(["active", "trialing", "beta"])("returns a plan for %s access", async (membership) => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    if (membership === "beta") mocks.betaUser.mockResolvedValue({ id: "beta" });
    else mocks.user.mockResolvedValue({ subscription: { status: membership } });

    const response = await coach(coachRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, plan: { focusMetric: "Steady tempo" } });
    expect(mocks.rateLimit).toHaveBeenCalledWith("student@example.com", "coach");
  });

  it("preserves the legacy sheet format and shares the same rate-limit scope", async () => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    mocks.betaUser.mockResolvedValue({ id: "beta" });

    const response = await sheet(coachRequest());
    expect(await response.json()).toMatchObject({ text: expect.stringContaining("Drums"), videos: expect.any(Array) });
    expect(mocks.rateLimit).toHaveBeenCalledWith("student@example.com", "coach");
    expect(mocks.search).not.toHaveBeenCalled();
  });

  it("returns 429 without calling providers when a member has hit their limit", async () => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    mocks.user.mockResolvedValue({ subscription: { status: "active" } });
    mocks.rateLimit.mockResolvedValue(Response.json({ error: "Limited" }, { status: 429 }));

    expect((await coach(coachRequest())).status).toBe(429);
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.search).not.toHaveBeenCalled();
  });

  it("returns the practice plan with fallback videos when YouTube fails", async () => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    mocks.betaUser.mockResolvedValue({ id: "beta" });
    mocks.search.mockRejectedValue(new Error("provider detail"));

    const result = await (await coach(coachRequest())).json();
    expect(result.ok).toBe(true);
    expect(result.videos).not.toHaveLength(0);
    expect(result).not.toHaveProperty("debug");
  });
});
