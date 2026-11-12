import { describe, expect, it } from "vitest";
import { coachInputSchema, validatePracticePlan } from "@/lib/coach-plan";
import { planToMarkdown } from "@/lib/coach-markdown";
import { buildCoachPrompt } from "@/lib/prompts";

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
  const instruments = ["Guitar", "Bass", "Drums", "Keyboards", "Vocals"];
  const modes = [
    ["practice_plan", "Practice Plan", "balanced plan"],
    ["warmups", "Warmups", "Use warmups"],
    ["chords", "Grooves / Ideas", "repeatable musical ideas"],
    ["next_session", "Next Session", "last session notes"],
  ];

  describe.each(instruments)("%s", (instrument) => {
    it.each(modes)("uses the right heading and instructions for %s", (mode, label, instruction) => {
      const input = coachInputSchema.parse({ instrument, mode, timePerDay: "15 minutes", daysPerWeek: "1" });
      const plan = validatePracticePlan(draft, input);
      expect(plan).toMatchObject({ instrument, mode });
      expect(planToMarkdown(plan!)).toMatch(`# ${instrument} – ${label}
`);
      expect(buildCoachPrompt(input, false)).toContain(instruction);
    });
  });

  it.each([
    ["Guitar", "guitar riffs"],
    ["Bass", "single-note bass grooves"],
    ["Drums", "kick, snare, and hi-hat"],
    ["Keyboards", "left- and right-hand roles"],
    ["Vocals", "singable melodic or rhythmic phrases"],
  ])("prompts for instrument-specific %s groove exercises", (instrument, guidance) => {
    const input = coachInputSchema.parse({ instrument, mode: "chords" });
    const prompt = buildCoachPrompt(input, false);
    expect(prompt).toContain(guidance);
    if (instrument === "Bass") expect(prompt).toContain("Play one note at a time");
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
