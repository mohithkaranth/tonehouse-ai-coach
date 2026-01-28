import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COACH_API_VERSION = "coach-v11-json-output-2026-01-28";

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

function pickVideos(params: { instrument: string }): VideoRec[] {
  const inst = toLower(params.instrument);

  if (inst.includes("drum")) {
    return [
      { title: "Single Stroke Roll – Rudiment Lesson", url: "https://www.youtube.com/watch?v=KjpGoOq-0gc" },
      { title: "Practice Pad Warmup – Hands & Timing", url: "https://www.youtube.com/watch?v=nxM7i_GPars" },
    ];
  }

  if (inst.includes("guitar")) {
    return [
      { title: "One Minute Changes – Faster Chord Switching", url: "https://www.youtube.com/watch?v=Ck73R_GjowE" },
      { title: "Strumming & Rhythm Control", url: "https://www.youtube.com/watch?v=9iVDuMN1BJA" },
    ];
  }

  if (inst.includes("bass")) {
    return [
      { title: "Beginning The Major Scale (Bass Lesson)", url: "https://www.youtube.com/watch?v=2bvgAbWRdIA" },
      { title: "How To Practice Scales Like A Pro (Bass)", url: "https://www.youtube.com/watch?v=J7NxTxpklHY" },
    ];
  }

  if (inst.includes("keyboard") || inst.includes("keys") || inst.includes("piano")) {
    return [
      { title: "Beginner Piano Practice Routine (Search)", url: "https://www.youtube.com/results?search_query=beginner+piano+practice+routine" },
      { title: "Piano Hand Independence Beginner (Search)", url: "https://www.youtube.com/results?search_query=piano+hand+independence+beginner" },
    ];
  }

  if (inst.includes("vocal") || inst.includes("sing")) {
    return [
      { title: "Vocal Warmups for Beginners (Search)", url: "https://www.youtube.com/results?search_query=vocal+warmups+for+beginners" },
      { title: "Breath Support Basics for Singing (Search)", url: "https://www.youtube.com/results?search_query=breath+support+basics+singing" },
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

    // Some models still accidentally wrap in ```json ... ```
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

    const videos = pickVideos({ instrument });

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

    // Validate shape + enforce instrument/mode match
    if (!isPlanJson(plan) || plan.instrument !== instrument || plan.mode !== mode) {
      return NextResponse.json(
        {
          version: COACH_API_VERSION,
          ok: false,
          error: "Model returned JSON but it did not match the required schema/constraints.",
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
