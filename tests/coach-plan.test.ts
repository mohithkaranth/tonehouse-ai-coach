import { describe, expect, it } from "vitest";
import { coachInputSchema, validatePracticePlan } from "@/lib/coach-plan";

const draft = {
  focusMetric: "Play eight clean measures at 80 BPM",
  dayByDay: [{
    day: 1,
    title: "Timing",
    blocks: [
      { name: "Warmup", minutes: 5, bullets: ["Play quarters with a metronome"] },
      { name: "Drill", minutes: 10, bullets: ["Add eighth notes"] },
    ],
  }],
  notes: [],
};

describe("practice plans", () => {
  it.each(["Guitar", "Bass", "Drums", "Keyboards", "Vocals"])("validates time and preserves %s input", (instrument) => {
    const input = coachInputSchema.parse({ instrument, timePerDay: "15 minutes", daysPerWeek: "1" });
    expect(validatePracticePlan(draft, input)).toMatchObject({ instrument, mode: "practice_plan" });
  });

  it("rejects a wrong day count, incorrect daily totals and unplayable durations", () => {
    expect(validatePracticePlan(draft, coachInputSchema.parse({ daysPerWeek: 2, timePerDay: 15 }))).toBeNull();
    expect(validatePracticePlan(draft, coachInputSchema.parse({ daysPerWeek: 1, timePerDay: 30 }))).toBeNull();
    const invalid = structuredClone(draft);
    invalid.dayByDay[0].blocks[0].minutes = 0;
    invalid.dayByDay[0].blocks[1].minutes = 15;
    expect(validatePracticePlan(invalid, coachInputSchema.parse({ daysPerWeek: 1, timePerDay: 15 }))).toBeNull();
  });

  it("accepts time given in hours", () => {
    expect(coachInputSchema.parse({ timePerDay: "1.5 hours" }).timePerDay).toBe(90);
  });

  it("rejects fractional days and excessively long notes", () => {
    expect(coachInputSchema.safeParse({ daysPerWeek: "1.5" }).success).toBe(false);
    expect(coachInputSchema.safeParse({ lastSessionNotes: "a".repeat(2001) }).success).toBe(false);
  });
});
