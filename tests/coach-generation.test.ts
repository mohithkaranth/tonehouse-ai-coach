import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePracticePlan } from "@/lib/coach-generation";
import { coachInputSchema } from "@/lib/coach-plan";

function providerPlan(minutes: number) {
  const plan = {
    focusMetric: "Hold a steady beat",
    dayByDay: [{ day: 1, title: "Time", blocks: [{ name: "Drill", minutes, bullets: ["Count aloud"] }] }],
    notes: [],
  };
  return Response.json({
    status: "completed",
    object: "response",
    output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(plan) }] }],
  });
}

describe("OpenAI integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends a strict Responses schema and retries an invalid practice duration once", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_COACH_MODEL", "");
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerPlan(5))
      .mockResolvedValueOnce(providerPlan(10));
    vi.stubGlobal("fetch", fetch);

    const input = coachInputSchema.parse({ instrument: "Bass", mode: "chords", daysPerWeek: 1, timePerDay: 10 });
    const plan = await generatePracticePlan(input);

    expect(plan).toMatchObject({ instrument: "Bass", dayByDay: [{ day: 1 }] });
    expect(fetch).toHaveBeenCalledTimes(2);
    const [url, request] = fetch.mock.calls[0];
    expect(String(url)).toContain("/responses");
    const payload = JSON.parse(request.body);
    expect(JSON.parse(payload.input)).toMatchObject({ mode: "Grooves / Ideas" });
    expect(payload.instructions).toContain("single-note bass grooves");
    expect(payload).toMatchObject({
      model: "gpt-6-luna",
      store: false,
      text: { format: { name: "practice_plan", type: "json_schema", strict: true } },
    });
  });
});
