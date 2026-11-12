import type { CoachMode } from "./coach-plan";

export const coachModeLabels = {
  practice_plan: "Practice Plan",
  warmups: "Warmups",
  chords: "Grooves / Ideas",
  next_session: "Next Session",
} satisfies Record<CoachMode, string>;
