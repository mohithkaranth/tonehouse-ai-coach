import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COACH_API_VERSION = "coach-v12-level-aware-videos-2026-01-28";

type PlanJSON = {
  instrument: string;
  mode: string;
  level: string;
  genre: string;
  goals: string;
  focusMetric: string;
  dayByDay: Array<{
    day: number;
    title: string;
    blocks: Array<{
      name: string;
      minutes: number;
      bullets: string[];
    }>;
  }>;
  notes?: string[];
};

type VideoRec = { title: string; url: string };

function toLower(s: unknown) {
  return String(s ?? "").toLowerCase();
}

function normLevel(level: string) {
  const l = toLower(level);
  if (l.includes("begin")) return "beginner";
  if (l.includes("inter")) return "intermediate";
  if (l.includes("adv")) return "advanced";
  return "beginner";
}

function normMode(mode: string) {
  const m = toLower(mode);
  if (m.includes("warm")) return "warmups";
  if (m.includes("chord")) return "chords";
  if (m.includes("next")) return "next_session";
  return "practice_plan";
}

/**
 * ✅ Level-aware and mode-aware curated videos (stable, no YouTube API dependency)
 * We intentionally use well-known evergreen topics. If a link ever dies, swap just the URL.
 */
function pickVideos(params: { instrument: string; level: string; mode: string }): VideoRec[] {
  const inst = toLower(params.instrument);
  const level = normLevel(params.level);
  const mode = normMode(params.mode);

  // --- DRUMS ---
  if (inst.includes("drum")) {
    if (level === "beginner") {
      if (mode === "warmups") {
        return [
          { title: "Practice Pad Warmup – Hands & Timing", url: "https://www.youtube.com/watch?v=nxM7i_GPars" },
          { title: "Single Stroke Roll – Rudiment Lesson", url: "https://www.youtube.com/watch?v=KjpGoOq-0gc" },
        ];
      }
      return [
        { title: "8th-note Hi-hat Groove Basics (Search)", url: "https://www.youtube.com/results?search_query=beginner+drum+groove+8th+note+hi+hat" },
        { title: "Single Stroke Roll – Rudiment Lesson", url: "https://www.youtube.com/watch?v=KjpGoOq-0gc" },
      ];
    }

    if (level === "intermediate") {
      if (mode === "warmups") {
        return [
          { title: "Drum Warmups: Control, Speed & Consistency (Search)", url: "https://www.youtube.com/results?search_query=drum+warmup+control+speed+consistency" },
          { title: "Paradiddle Variations (Search)", url: "https://www.youtube.com/results?search_query=paradiddle+variations+drums+intermediate" },
        ];
      }
      return [
        { title: "Independence / Coordination (Search)", url: "https://www.youtube.com/results?search_query=drum+independence+coordination+intermediate" },
        { title: "16th-note Hi-hat Groove Control (Search)", url: "https://www.youtube.com/results?search_query=16th+note+hi+hat+groove+intermediate+drums" },
      ];
    }

    // advanced
    if (mode === "warmups") {
      return [
        { title: "Advanced Hand Technique & Speed (Search)", url: "https://www.youtube.com/results?search_query=advanced+drum+hand+technique+speed+workout" },
        { title: "Advanced Coordination / Polyrhythms (Search)", url: "https://www.youtube.com/results?search_query=advanced+drum+polyrhythm+coordination" },
      ];
    }
    return [
      { title: "Metric Modulation (Search)", url: "https://www.youtube.com/results?search_query=metric+modulation+drums+lesson" },
      { title: "Odd Time Grooves (Search)", url: "https://www.youtube.com/results?search_query=odd+time+grooves+drums+advanced" },
    ];
  }

  // --- GUITAR ---
  if (inst.includes("guitar")) {
    if (level === "beginner") {
      if (mode === "warmups") {
        return [
          { title: "Beginner Guitar Warmup Exercises (Search)", url: "https://www.youtube.com/results?search_query=beginner+guitar+warmup+exercises" },
          { title: "One Minute Changes – Faster Chord Switching", url: "https://www.youtube.com/watch?v=Ck73R_GjowE" },
        ];
      }
      if (mode === "chords") {
        return [
          { title: "Beginner Strumming Patterns (Search)", url: "https://www.youtube.com/results?search_query=beginner+guitar+strumming+patterns" },
          { title: "One Minute Changes – Faster Chord Switching", url: "https://www.youtube.com/watch?v=Ck73R_GjowE" },
        ];
      }
      return [
        { title: "One Minute Changes – Faster Chord Switching", url: "https://www.youtube.com/watch?v=Ck73R_GjowE" },
        { title: "Strumming & Rhythm Control", url: "https://www.youtube.com/watch?v=9iVDuMN1BJA" },
      ];
    }

    if (level === "intermediate") {
      if (mode === "warmups") {
        return [
          { title: "Alternate Picking Workout (Search)", url: "https://www.youtube.com/results?search_query=alternate+picking+workout+intermediate+guitar" },
          { title: "Fretboard Note Memorization (Search)", url: "https://www.youtube.com/results?search_query=fretboard+notes+exercise+guitar+intermediate" },
        ];
      }
      if (mode === "chords") {
        return [
          { title: "Barre Chords Clean & Fast (Search)", url: "https://www.youtube.com/results?search_query=barre+chords+clean+fast+intermediate+guitar" },
          { title: "Rhythm Guitar Tight Timing (Search)", url: "https://www.youtube.com/results?search_query=rhythm+guitar+tight+timing+intermediate" },
        ];
      }
      return [
        { title: "Pentatonic Scale Phrases (Search)", url: "https://www.youtube.com/results?search_query=pentatonic+scale+phrases+intermediate+guitar" },
        { title: "Strumming Dynamics & Muting (Search)", url: "https://www.youtube.com/results?search_query=guitar+strumming+dynamics+muting+intermediate" },
      ];
    }

    // advanced
    if (mode === "warmups") {
      return [
        { title: "Advanced Picking Speed Routine (Search)", url: "https://www.youtube.com/results?search_query=advanced+picking+speed+routine+guitar" },
        { title: "Legato / Economy Picking Drill (Search)", url: "https://www.youtube.com/results?search_query=legato+economy+picking+drill+advanced+guitar" },
      ];
    }
    if (mode === "chords") {
      return [
        { title: "Jazz Chord Voicings (Search)", url: "https://www.youtube.com/results?search_query=jazz+guitar+chord+voicings+advanced" },
        { title: "Neo-soul Chord Tricks (Search)", url: "https://www.youtube.com/results?search_query=neo+soul+guitar+chords+advanced" },
      ];
    }
    return [
      { title: "Advanced Improvisation Concepts (Search)", url: "https://www.youtube.com/results?search_query=advanced+guitar+improvisation+concepts" },
      { title: "Timing / Subdivision for Guitarists (Search)", url: "https://www.youtube.com/results?search_query=timing+subdivision+for+guitarists+advanced" },
    ];
  }

  // --- BASS ---
  if (inst.includes("bass")) {
    if (level === "beginner") {
      return [
        { title: "Beginner Bass Groove & Timing (Search)", url: "https://www.youtube.com/results?search_query=beginner+bass+groove+timing+exercise" },
        { title: "Beginning The Major Scale (Bass Lesson)", url: "https://www.youtube.com/watch?v=2bvgAbWRdIA" },
      ];
    }
    if (level === "intermediate") {
      return [
        { title: "Bass Muting Techniques (Search)", url: "https://www.youtube.com/results?search_query=bass+muting+technique+intermediate" },
        { title: "16th-note Bass Groove Control (Search)", url: "https://www.youtube.com/results?search_query=16th+note+bass+groove+intermediate" },
      ];
    }
    return [
      { title: "Advanced Bass Fills & Pocket (Search)", url: "https://www.youtube.com/results?search_query=advanced+bass+fills+pocket" },
      { title: "Chord Tones & Walking Bass (Search)", url: "https://www.youtube.com/results?search_query=chord+tones+walking+bass+advanced" },
    ];
  }

  // --- KEYBOARDS ---
  if (inst.includes("keyboard") || inst.includes("keys") || inst.includes("piano")) {
    if (level === "beginner") {
      return [
        { title: "Beginner Piano Practice Routine (Search)", url: "https://www.youtube.com/results?search_query=beginner+piano+practice+routine" },
        { title: "Piano Hand Independence Beginner (Search)", url: "https://www.youtube.com/results?search_query=piano+hand+independence+beginner" },
      ];
    }
    if (level === "intermediate") {
      return [
        { title: "Piano Chord Voicings Intermediate (Search)", url: "https://www.youtube.com/results?search_query=piano+chord+voicings+intermediate" },
        { title: "Scales & Arpeggios Workout (Search)", url: "https://www.youtube.com/results?search_query=piano+scales+arpeggios+workout" },
      ];
    }
    return [
      { title: "Advanced Voicings & Voice Leading (Search)", url: "https://www.youtube.com/results?search_query=advanced+piano+voicings+voice+leading" },
      { title: "Polyrhythms on Piano (Search)", url: "https://www.youtube.com/results?search_query=polyrhythms+piano+advanced" },
    ];
  }

  // --- VOCALS ---
  if (inst.includes("vocal") || inst.includes("sing")) {
    if (level === "beginner") {
      return [
        { title: "Vocal Warmups for Beginners (Search)", url: "https://www.youtube.com/results?search_query=vocal+warmups+for+beginners" },
        { title: "Breath Support Basics for Singing (Search)", url: "https://www.youtube.com/results?search_query=breath+support+basics+singing" },
      ];
    }
    if (level === "intermediate") {
      return [
        { title: "Vocal Placement & Resonance (Search)", url: "https://www.youtube.com/results?search_query=vocal+placement+resonance+intermediate" },
        { title: "Pitch Accuracy Drills (Search)", url: "https://www.youtube.com/results?search_query=pitch+accuracy+drills+singing" },
      ];
    }
    return [
      { title: "Vocal Runs & Agility (Search)", url: "https://www.youtube.com/results?search_query=vocal+runs+agility+advanced" },
      { title: "Mixed Voice Technique (Search)", url: "https://www.youtube.com/results?search_query=mixed+voice+technique+advanced" },
    ];
  }

  return [];
}

function buildJsonPrompt(params: {
  mode: string;
  instrument: string;
  level: string;
  goals: string;
  genre: string;
  timePerDay: string;
  daysPerWeek: number;
  lastSessionNotes: string;
  retry?: boolean;
}) {
  const { mode, instrument, level, goals, genre, timePerDay, daysPerWeek, lastSessionNotes, retry } =
    params;

  return `
You are Tonehouse AI Coach.

Return ONLY valid JSON (no Markdown, no backticks, no extra text).
Your entire response MUST be a single JSON object.

CONSTRAINTS:
- instrument MUST be exactly: "${instrument}"
- mode MUST be exactly: "${mode}"
- dayByDay MUST have exactly ${daysPerWeek} items (Day 1..Day ${daysPerWeek})
- Each block.minutes must be a number (integer)
- Each block.bullets must be an array of strings

${retry ? `RETRY:
- Your previous output was not valid JSON or didn’t follow constraints.
- Output ONLY the JSON object.` : ""}

USER CONTEXT:
instrument: ${instrument}
mode: ${mode}
level: ${level}
genre: ${genre}
goals: ${goals}
timePerDay: ${timePerDay}
daysPerWeek: ${daysPerWeek}
lastSessionNotes: ${lastSessionNotes}

JSON SHAPE (must match):
{
  "instrument": "${instrument}",
  "mode": "${mode}",
  "level": "${level}",
  "genre": "${genre}",
  "goals": "${goals}",
  "focusMetric": "string",
  "dayByDay": [
    {
      "day": 1,
      "title": "string",
      "blocks": [
        { "name": "Warmup", "minutes": 10, "bullets": ["..."] }
      ]
    }
  ],
  "notes": ["optional strings"]
}
`.trim();
}

function safeParseJson(text: string): { ok: true; value: any } | { ok: false; error: string } {
  try {
    const trimmed = String(text ?? "").trim();
    const cleaned = trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const value = JSON.parse(cleaned);
    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, error: e?.message || "JSON parse error" };
  }
}

function isPlanJson(x: any): x is PlanJSON {
  if (!x || typeof x !== "object") return false;
  if (typeof x.instrument !== "string") return false;
  if (typeof x.mode !== "string") return false;
  if (!Array.isArray(x.dayByDay)) return false;
  if (typeof x.focusMetric !== "string") return false;

  for (const d of x.dayByDay) {
    if (!d || typeof d !== "object") return false;
    if (typeof d.day !== "number") return false;
    if (typeof d.title !== "string") return false;
    if (!Array.isArray(d.blocks)) return false;
    for (const b of d.blocks) {
      if (!b || typeof b !== "object") return false;
      if (typeof b.name !== "string") return false;
      if (typeof b.minutes !== "number") return false;
      if (!Array.isArray(b.bullets)) return false;
    }
  }
  return true;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { version: COACH_API_VERSION, ok: false, error: "Missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey });

  try {
    const body = await req.json();

    const mode = String(body.mode ?? "practice_plan");
    const instrument = String(body.instrument ?? "Guitar").trim();
    const level = String(body.level ?? "Beginner");
    const goals = String(body.goals ?? "Improve timing and technique");
    const genre = String(body.genre ?? "Rock");
    const timePerDay = String(body.timePerDay ?? "30 minutes");
    const daysPerWeekNum = Number(body.daysPerWeek ?? 5);
    const daysPerWeek = Number.isFinite(daysPerWeekNum) ? Math.max(1, Math.min(7, daysPerWeekNum)) : 5;
    const lastSessionNotes = String(body.lastSessionNotes ?? "");

    const videos = pickVideos({ instrument, level, mode });

    async function generateOnce(retry: boolean) {
      const prompt = buildJsonPrompt({
        mode,
        instrument,
        level,
        goals,
        genre,
        timePerDay,
        daysPerWeek,
        lastSessionNotes,
        retry,
      });

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1400,
        messages: [
          {
            role: "system",
            content:
              "Return ONLY valid JSON. No Markdown. No extra commentary. Match the schema exactly.",
          },
          { role: "user", content: prompt },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? "";
    }

    let raw = await generateOnce(false);

    let parsed = safeParseJson(raw);
    if (!parsed.ok) {
      raw = await generateOnce(true);
      parsed = safeParseJson(raw);
    }

    if (!parsed.ok) {
      return NextResponse.json(
        {
          version: COACH_API_VERSION,
          ok: false,
          error: "Model did not return valid JSON.",
          received: { instrument, mode, level, genre },
          debug: { parseError: parsed.error, raw: raw.slice(0, 1200) },
          videos,
        },
        { status: 500 }
      );
    }

    const plan = parsed.value;

    if (!isPlanJson(plan) || plan.instrument !== instrument || plan.mode !== mode) {
      return NextResponse.json(
        {
          version: COACH_API_VERSION,
          ok: false,
          error: "Model returned JSON but did not match schema/constraints.",
          received: { instrument, mode, level, genre },
          debug: { planInstrument: plan?.instrument, planMode: plan?.mode, raw: raw.slice(0, 1200) },
          videos,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      version: COACH_API_VERSION,
      ok: true,
      received: { instrument, mode, level, genre },
      plan,
      videos,
    });
  } catch (err: any) {
    return NextResponse.json(
      { version: COACH_API_VERSION, ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
