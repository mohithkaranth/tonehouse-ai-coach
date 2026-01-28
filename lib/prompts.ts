export type CoachMode = "practice_plan" | "warmups" | "chords" | "next_session";

export function buildCoachPrompt(input: {
  mode: CoachMode;
  instrument: string;
  level: string;
  goals: string;
  genre?: string;
  timePerDay?: string;
  daysPerWeek?: string;
  lastSessionNotes?: string;
}) {
  const base = `
You are "Tonehouse Coach", a friendly but precise music teacher.
Output must be structured in clear markdown with headings and bullet points.
Keep it practical, time-boxed, and suitable for the student's level.
If something is unclear, make a reasonable assumption and state it briefly.

Student profile:
- Instrument: ${input.instrument}
- Level: ${input.level}
- Goals: ${input.goals}
- Genre (if relevant): ${input.genre ?? "not specified"}
- Time per day: ${input.timePerDay ?? "not specified"}
- Days per week: ${input.daysPerWeek ?? "not specified"}
- Last session notes: ${input.lastSessionNotes ?? "none"}
`;

  const modeInstructions: Record<string, string> = {
    practice_plan: `
Create a weekly practice plan. Include:
1) Warmup (5–10 min)
2) Core skill work (20–30 min)
3) Repertoire/song work (15–30 min)
4) Ear training or rhythm (5–10 min)
5) "How to measure progress" checklist
Also include a 4-week progression (Week 1–4).
`,
    warmups: `
Generate 8 warmups/exercises appropriate for the level.
Each should have: purpose, exact steps, duration, and common mistakes.
`,
    chords: `
Suggest 5 chord progressions for the genre/mood. For each:
- Progression (Roman numerals + example in a key)
- Variation (2 alternatives)
- Practice tip (voicings or rhythm)
`,
    next_session: `
Based on last session notes, suggest:
- What to repeat
- What to change
- A focused 30-minute session plan
- One motivational note
`
  };

  return base + "\n" + (modeInstructions[input.mode] ?? modeInstructions.practice_plan);
}
 	