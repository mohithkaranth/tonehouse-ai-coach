import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Version stamp so you can confirm what’s deployed
const COACH_API_VERSION = "coach-v8-header-tolerant-2026-01-28";

type VideoRec = { title: string; url: string };

function toLower(s: unknown) {
  return String(s ?? "").toLowerCase();
}

function includesAny(text: string, keywords: string[]) {
  const t = toLower(text);
  return keywords.some((k) => t.includes(k));
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

/**
 * Extract the first meaningful line (ignores empty lines and common preambles)
 */
function firstMeaningfulLine(text: string): string {
  const lines = String(text ?? "").split(/\r?\n/).map((l) => l.trim());

  for (const l of lines) {
    if (!l) continue;

    // Ignore typical LLM preamble lines
    const lower = l.toLowerCase();
    if (
      lower === "sure!" ||
      lower === "sure." ||
      lower.startsWith("sure,") ||
      lower.startsWith("of course") ||
      lower.startsWith("here’s") ||
      lower.startsWith("here is") ||
      lower.startsWith("here's")
    ) {
      continue;
    }

    return l;
  }

  return "";
}

/**
 * Normalize a line so we accept markdown variants like:
 * "**Instrument: Drums**" or "`Instrument: Drums`"
 */
function normalizeHeaderLine(line: string): string {
  let s = String(line ?? "").trim();

  // strip surrounding markdown emphasis/backticks
  s = s.replace(/^(\*\*|__|`)+/, "").replace(/(\*\*|__|`)+$/, "").trim();

  // remove trailing punctuation commonly added
  s = s.replace(/[.!]+$/, "").trim();

  return s;
}

/**
 * Drift detector:
 * - header must contain correct instrument line (tolerant)
 * - keyword checks prevent mixed-instrument generic plans
 */
function looksWrongInstrument(output: string, instrument: string): boolean {
  const out = String(output ?? "").trim();
  const outLower = toLower(out);

  const inst = String(instrument ?? "").trim();
  const instLower = toLower(inst);

  // ✅ Header check (tolerant)
  const header = normalizeHeaderLine(firstMeaningfulLine(out));
  const required = `Instrument: ${inst}`;
  if (header !== required) return true;

  // ✅ Keyword drift checks
  const hasAny = (words: string[]) => words.some((w) => outLower.includes(w));

  if (instLower.includes("drum")) {
    // For drums, block mixed-instrument generic plans
    return hasAny([
      "vocal",
      "sing",
      "breath",
      "breathing",
      "pitch",
      "chord",
      "chords",
      "scale",
      "scales",
      "hanon",
      "string instrument",
      "string instruments",
      "piano",
      "keyboard",
      "guitar",
      "bass",
      "strum",
      "fretting",
      "fret",
    ]);
  }

  if (instLower.includes("guitar")) {
    return hasAny([
      "vocal",
      "sing",
      "breath",
      "breathing",
      "rudiment",
      "paradiddle",
      "single stroke",
      "double stroke",
      "hi-hat",
      "snare",
      "kick",
      "drum",
      "drumming",
      "stickings",
      "hanon",
    ]);
  }

  if (instLower.includes("bass")) {
    return hasAny([
      "vocal",
      "sing",
      "breath",
      "breathing",
      "rudiment",
      "paradiddle",
      "hi-hat",
      "snare",
      "kick",
      "drum",
      "drumming",
      "hanon",
    ]);
  }

  // Keyboards/Vocals: header lock is enough for now
  return false;
}

function buildPrompt(params: {
  mode: string;
  instrument: string;
  level: string;
  goals: string;
  genre: string;
  timePerDay: string;
  daysPerWeek: string;
  lastSessionNotes: string;
  retry?: boolean;
}) {
  const {
    mode,
    instrument,
    level,
    goals,
    genre,
    timePerDay,
    daysPerWeek,
    lastSessionNotes,
    retry,
  } = params;

  return `
You are Tonehouse AI Coach.

STRICT INSTRUMENT LOCK:
- The ONLY instrument for this plan is: "${instrument}".
- You MUST write the plan ONLY for "${instrument}".
- DO NOT mention exercises or techniques for any other instrument.
- Output MUST start immediately with the exact line: Instrument: ${instrument}
- No intro text. No "Sure". No preamble.

${retry ? `RETRY MODE:
- Your previous output drifted or used a generic mixed-instrument plan.
- Start immediately with: Instrument: ${instrument}
- Do not mention ANY other instruments.
- Every bullet must be explicitly playable on "${instrument}".` : ""}

USER CONTEXT:
Instrument: ${instrument}
Mode: ${mode.replaceAll("_", " ")}
Level: ${level}
Genre: ${genre}
Goals: ${goals}
Time per day: ${timePerDay}
Days per week: ${daysPerWeek}
Last session notes: ${lastSessionNotes}

OUTPUT REQUIREMENTS:
- Output in Markdown
- Use headings + bullet points
- Be practical and specific
- Include a day-by-day template (Day 1..Day ${daysPerWeek})
- Include a "Focus Metric"

DRUMS (if instrument is Drums):
- You MUST include: rudiments, stickings, subdivisions, coordination/independence, and metronome tempos.
- Every exercise must reference drums explicitly (snare/kick/hi-hat/toms/ride or practice pad).
- You MUST NOT include: breathing, singing, scales, chords, Hanon, string instruments, piano, guitar.

BEGIN NOW.
`.trim();
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { version: COACH_API_VERSION, error: "Missing OPENAI_API_KEY." },
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
    const daysPerWeek = String(body.daysPerWeek ?? "5");
    const lastSessionNotes = String(body.lastSessionNotes ?? "");

    const videos = pickVideos({ instrument });

    async function generateOnce(retry: boolean) {
      const prompt = buildPrompt({
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
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "Follow the selected instrument strictly. No mixed-instrument plans. Start immediately with the exact Instrument line.",
          },
          { role: "user", content: prompt },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? "No response.";
    }

    let text = await generateOnce(false);

    if (looksWrongInstrument(text, instrument)) {
      text = await generateOnce(true);
    }

    if (looksWrongInstrument(text, instrument)) {
      return NextResponse.json(
        {
          version: COACH_API_VERSION,
          error:
            "AI output drifted to the wrong instrument (even after retry). Please try again.",
          received: { instrument, mode, level, genre },
          videos,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      version: COACH_API_VERSION,
      received: { instrument, mode, level, genre },
      text,
      videos,
    });
  } catch (err: any) {
    return NextResponse.json(
      { version: COACH_API_VERSION, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
