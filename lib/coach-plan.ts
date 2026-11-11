import { z } from "zod";

const modes = ["practice_plan", "warmups", "chords", "next_session"] as const;
export type CoachMode = (typeof modes)[number];

function parseInteger(value: unknown, pattern: RegExp) {
  if (typeof value !== "string") return value;
  const match = value.trim().match(pattern);
  return match ? Number(match[1]) : value;
}

function parseMinutes(value: unknown) {
  if (typeof value !== "string") return value;
  const hours = value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)$/i);
  return hours ? Number(hours[1]) * 60 : parseInteger(value, /^(\d+)(?:\s*(?:minutes?|mins?|m))?$/i);
}

export const coachInputSchema = z.object({
  instrument: z.enum(["Guitar", "Drums", "Bass", "Keyboards", "Vocals"]).default("Guitar"),
  mode: z.enum(modes).default("practice_plan"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  genre: z.string().trim().max(80).default("Rock"),
  goals: z.string().trim().max(600).default("Improve timing and technique"),
  timePerDay: z.preprocess(
    parseMinutes,
    z.number().int().min(1).max(180).default(30),
  ),
  daysPerWeek: z.preprocess(
    (value) => parseInteger(value, /^(\d+)$/),
    z.number().int().min(1).max(7).default(5),
  ),
  lastSessionNotes: z.string().trim().max(2000).default(""),
});

export type CoachInput = z.infer<typeof coachInputSchema>;

export const generatedPlanSchema = z.object({
  focusMetric: z.string(),
  dayByDay: z.array(z.object({
    day: z.number(),
    title: z.string(),
    blocks: z.array(z.object({
      name: z.string(),
      minutes: z.number(),
      bullets: z.array(z.string()),
    })),
  })),
  notes: z.array(z.string()),
});

type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
export type PracticePlan = GeneratedPlan & Pick<CoachInput, "instrument" | "mode" | "level" | "genre" | "goals">;

export function validatePracticePlan(value: unknown, input: CoachInput): PracticePlan | null {
  const result = generatedPlanSchema.safeParse(value);
  if (!result.success) return null;
  const plan = result.data;
  if (!plan.focusMetric.trim() || plan.dayByDay.length !== input.daysPerWeek) return null;

  for (const [index, day] of plan.dayByDay.entries()) {
    if (day.day !== index + 1 || !day.title.trim() || !day.blocks.length) return null;
    let minutes = 0;
    for (const block of day.blocks) {
      if (!block.name.trim() || !Number.isInteger(block.minutes) || block.minutes < 1) return null;
      if (!block.bullets.length || block.bullets.some((bullet) => !bullet.trim())) return null;
      minutes += block.minutes;
    }
    if (minutes !== input.timePerDay) return null;
  }

  const { instrument, mode, level, genre, goals } = input;
  return { ...plan, instrument, mode, level, genre, goals };
}
