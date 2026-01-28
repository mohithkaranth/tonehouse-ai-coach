import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COACH_API_VERSION = "coach-v9-relaxed-guitar-check-2026-01-28";

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

/** Ignore empty lines + common “Sure!/Here’s…” preambles */
function firstMeaningfulLine(text: string): string {
  const lines = String(text ?? "").split(/\r?\n/).map((l) => l.trim());
  for (const l of lines) {
    if (!l) continue;

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

/** Strip simple markdown wrappers like ** **, __ __, ` `, and heading prefix */
function normalizeLine(line: string): string {
  let s = String(line ?? "").trim();

  // remove leading markdown heading symbols
  s = s.replace(/^#{1,6}\s*/, "").trim();

  // strip emphasis/backticks around the whole line
  s = s.replace(/^(\*\*|__|`)+/, "").replace(/(\*\*|__|`)+$/, "").trim();

  // remove trailing punctuation
  s = s.replace(/[.!]+$/, "").trim();

  return s;
}

/**
 * Tolerant header check:
 * Accepts:
 * - "Instrument: Guitar"
 * - "Instrument: Guitar 🎸"
 * - "Instrument: Guitar (Beginner)"
 * - "Instrument: Guitar - Rock"
 * Also accepts different casing.
 */
function headerMatches(output: string, instrument: string) {
  const inst = String(instrument ?? "").trim();
  const instLower = toLower(inst);

  const first = normalizeLine(firstMeaningfulLine(output));
  const firstLower = toLower(first);

  // Must start with "instrument:"
  if (!firstLower.startsWith("instrument:")) return { ok: false, firstLine: first };

  // Everything after "instrument:" should start with the instrument (case-insensitive)
  const after = firstLower.replace(/^instrument:\s*/, "");
  const ok = after.startsWith(instLower);

  return { ok, firstLine: first };
}

function containsAny(outLower: string, words: string[]) {
  return words.some((w) => outLower.includes(w));
}

/**
 * Drift detector:
 * - header must match (tolerant)
 * - instrument-specific “wrong content” checks (less aggressive for guitar)
 */
function looksWrongInstrument(output: string, instrument: string) {
  const out = String(output ?? "").trim();
  const outLower = toLower(out);
  const instLower = toLower(String(instrument ?? "").trim());

  const header = headerMatches(out, instrument);
  if (!header.ok) {
    return { wrong: true, reason: "header_mismatch", headerLine: header.firstLine };
  }

  // Strong “not this instrument” indicators
  const vocalWords = ["vocal", "sing", "singer", "breath support", "diaphragm", "pitch", "resonance"];
  const genericMixedWords = ["hanon", "string instrument", "string instruments"];

  if (instLower.includes("drum")) {
    const forbidden = [
      ...vocalWords,
      ...genericMixedWords,
      "chord",
      "chords",
      "scale",
      "scales",
      "strum",
      "fretting",
      "fret",
      "guitar",
      "bass",
      "piano",
      "keyboard",
    ];
    if (containsAny(outLower, forbidden)) {
      return { wrong: true, reason: "drums_forbidden_keywords", headerLine: header.firstLine };
    }
    return { wrong: false, reason: "ok", headerLine: header.firstLine };
  }

  if (instLower.includes("guitar")) {
    // ✅ For guitar, only forbid vocals + very specific drum-rudiment language (NOT the word “drums”)
    const forbidden = [
      ...vocalWords,
      ...genericMixedWords,
      "rudiment",
      "paradiddle",
      "single stroke",
      "double stroke",
      "hi-hat",
      "stickings",
    ];
    if (containsAny(outLower, forbidden)) {
      return { wrong: true, reason: "guitar_forbidden_keywords", headerLine: header.firstLine };
    }
    return { wrong: false, reason: "ok", headerLine: header.firstLine };
  }

  if (instLower.includes("bass")) {
    const forbidden = [
      ...vocalWords,
      ...genericMixedWords,
      "rudiment",
      "paradiddle",
      "hi-hat",
      "stickings",
    ];
    if (containsAny(outLower, forbidden)) {
      return { wrong: true, reason: "bass_forbidden_keywords", headerLine: header.firstLine };
    }
    return { wrong: false, reason: "ok", headerLine: header.firstLine };
  }

  // Keyboards/vocals: header lock only (for now)
  return { wrong: false, reason: "ok", headerLine: header.firstLine };
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
- Write the plan ONLY for "${instrument}".
- START IMMEDIATELY with: Instrument: ${instrument}
- No intro text. No "Sure". No preamble.

${retry ? `RETRY MODE:
- Your previous output failed the instrument lock.
- Start immediately with: Instrument: ${instrument}
- Do not mention any other instruments or instrument-specific exercises.
` : ""}

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
- Markdown
- Headings + bullet points
- Day-by-day template (Day 1..Day ${daysPerWeek})
- Include a "Focus Metric"

INSTRUMENT GUIDANCE:
- DRUMS: rudiments, stickings, subdivisions, independence, tempo control, groove, fills (explicitly mention snare/kick/hat or practice pad)
- GUITAR: chords, fretting/picking, strumming, scales, timing, chord changes
- BASS: groove, timing, muting, locking with drums, fingerstyle/pick
- KEYBOARDS: hand independence, voicings, scales/arpeggios, metronome
- VOCALS: breath support, pitch, resonance, warmups

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
              "Follow the instrument lock strictly. Start immediately with the Instrument line. No mixed-instrument plans.",
          },
          { role: "user", content: prompt },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? "No response.";
    }

    let text = await generateOnce(false);

    let verdict = looksWrongInstrument(text, instrument);
    if (verdict.wrong) {
      text = await generateOnce(true);
      verdict = looksWrongInstrument(text, instrument);
    }

    if (verdict.wrong) {
      return NextResponse.json(
        {
          version: COACH_API_VERSION,
          error:
            "AI output drifted to the wrong instrument (even after retry). Please try again.",
          received: { instrument, mode, level, genre },
          debug: {
            reason: verdict.reason,
            firstMeaningfulLine: verdict.headerLine,
          },
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
