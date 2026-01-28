import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VideoRec = { title: string; url: string };

function toLower(s: unknown) {
  return String(s ?? "").toLowerCase();
}

function pickVideos(params: {
  instrument: string;
  mode: string;
  goals: string;
  genre: string;
  level: string;
}): VideoRec[] {
  const instrument = toLower(params.instrument);
  const goals = toLower(params.goals);
  const mode = toLower(params.mode);
  const genre = toLower(params.genre);
  const level = toLower(params.level);

  const vids: VideoRec[] = [];

  // ===== DRUMS (always return something) =====
  if (instrument.includes("drum")) {
    vids.push(
      {
        title: "Single Stroke Roll – Rudiment Lesson (Beginner Friendly)",
        url: "https://www.youtube.com/watch?v=KjpGoOq-0gc",
      },
      {
        title: "Practice Pad Warmup – Basic Hands & Timing",
        url: "https://www.youtube.com/watch?v=nxM7i_GPars",
      }
    );

    const wantsOdd =
      goals.includes("odd") ||
      goals.includes("7/8") ||
      goals.includes("5/4") ||
      goals.includes("9/8") ||
      goals.includes("polyr") ||
      goals.includes("prog") ||
      genre.includes("prog");

    if (wantsOdd) {
      vids.push({
        title: "Odd Time Drumming – How To Approach It",
        url: "https://www.youtube.com/watch?v=P24zDgwDn9w",
      });
    } else if (mode.includes("warmup")) {
      vids.push({
        title: "Warmups – Control, Speed & Consistency",
        url: "https://www.youtube.com/watch?v=qO0dlUCwyhc",
      });
    } else {
      vids.push({
        title: "Rock Groove Basics – Timekeeping & Backbeat",
        url: "https://www.youtube.com/watch?v=qO0dlUCwyhc",
      });
    }

    return vids.slice(0, 3);
  }

  // ===== GUITAR =====
  if (instrument.includes("guitar")) {
    vids.push({
      title: "One Minute Changes – Faster Chord Switching",
      url: "https://www.youtube.com/watch?v=Ck73R_GjowE",
    });

    const rhythmHeavy =
      goals.includes("strum") ||
      goals.includes("rhythm") ||
      goals.includes("timing") ||
      mode.includes("practice") ||
      mode.includes("warmup");

    vids.push({
      title: rhythmHeavy
        ? "Strumming & Timing Tip (Beginner Friendly)"
        : "Clean Technique Drill (Beginner Friendly)",
      url: rhythmHeavy
        ? "https://www.youtube.com/watch?v=9iVDuMN1BJA"
        : "https://www.youtube.com/watch?v=mAgc7hr44WM",
    });

    return vids.slice(0, 2);
  }

  // ===== BASS =====
  if (instrument.includes("bass")) {
    vids.push({
      title: "Fretting Hand Drill (Use as Bass Exercise)",
      url: "https://www.youtube.com/watch?v=Ck73R_GjowE",
    });
    return vids;
  }

  // ===== DEFAULT =====
  return [
    {
      title: "Practice Method: One Minute Changes (General)",
      url: "https://www.youtube.com/watch?v=Ck73R_GjowE",
    },
  ];
}

/**
 * Detect if the model drifted to the wrong instrument.
 * We only check for obvious “other-instrument” keywords based on the chosen instrument.
 * This is a pragmatic guardrail, not perfect NLP.
 */
function looksWrongInstrument(output: string, instrument: string): boolean {
  const out = toLower(output);
  const inst = toLower(instrument);

  // If user chose drums, disallow singing/pitch/chords/etc.
  if (inst.includes("drum")) {
    const forbidden = [
      "sing",
      "vocal",
      "breath",
      "breathing",
      "pitch",
      "scale",
      "scales",
      "chord",
      "chords",
      "strum",
      "fret",
      "fretting",
      "piano",
      "keyboard",
    ];
    return forbidden.some((w) => out.includes(w));
  }

  // If user chose guitar, disallow drumming and singing advice
  if (inst.includes("guitar")) {
    const forbidden = [
      "rudiment",
      "single stroke",
      "double stroke",
      "paradiddle",
      "stickings",
      "hi-hat",
      "snare",
      "kick",
      "vocal",
      "breath",
      "breathing",
    ];
    return forbidden.some((w) => out.includes(w));
  }

  // If user chose bass, disallow heavy drum/vocal advice (light check)
  if (inst.includes("bass")) {
    const forbidden = [
      "rudiment",
      "paradiddle",
      "hi-hat",
      "snare",
      "kick",
      "vocal",
      "breath",
      "breathing",
    ];
    return forbidden.some((w) => out.includes(w));
  }

  // For others, don’t block (yet)
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

  // Strong constraints + instrument-specific hints
  return `
You are Tonehouse AI Coach.

STRICT INSTRUMENT LOCK:
- The ONLY instrument for this plan is: "${instrument}".
- You MUST write the plan ONLY for "${instrument}".
- DO NOT mention exercises or techniques for any other instrument.
- If you start writing for a different instrument, STOP and rewrite immediately for "${instrument}".

${retry ? `RETRY MODE (IMPORTANT):
- Your previous output drifted to the wrong instrument.
- This time: do not mention ANY other instruments (vocals, singing, piano, guitar, bass, etc.).
- Make every bullet explicitly playable on "${instrument}".` : ""}

USER CONTEXT:
- Instrument: ${instrument}
- Mode: ${mode.replaceAll("_", " ")}
- Level: ${level}
- Genre: ${genre}
- Goals: ${goals}
- Time per day: ${timePerDay}
- Days per week: ${daysPerWeek}
- Last session notes: ${lastSessionNotes}

OUTPUT REQUIREMENTS:
- Output in Markdown
- Use headings + bullet points
- Keep it practical and specific
- Provide a day-by-day template (Day 1..Day ${daysPerWeek})
- Include a "Focus Metric" (what to measure to know it’s improving)

INSTRUMENT-SPECIFIC GUIDANCE:
- If instrument is DRUMS: use rudiments, stickings, subdivisions, coordination/independence, tempo control, groove, fills.
  Avoid pitch/chords/scales/singing/breath control.
- If instrument is GUITAR: use chords, rhythm/strumming, fretting hand, picking hand, scales, timing.
- If instrument is BASS: use groove, locking with drums, fingerstyle/pick, muting, timing, root notes.

BEGIN NOW.
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mode = String(body.mode ?? "practice_plan");
    const instrument = String(body.instrument ?? "Drums");
    const level = String(body.level ?? "Beginner");
    const goals = String(body.goals ?? "Improve timing and technique");
    const genre = String(body.genre ?? "Rock");
    const timePerDay = String(body.timePerDay ?? "30 minutes");
    const daysPerWeek = String(body.daysPerWeek ?? "5");
    const lastSessionNotes = String(body.lastSessionNotes ?? "");

    // Always return videos
    const videos = pickVideos({ instrument, mode, goals, genre, level });

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          text: "OPENAI_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.",
          videos,
        },
        { status: 200 }
      );
    }

    // Lazy import so build doesn’t execute OpenAI init
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });

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
        temperature: 0.2, // lower randomness => less drift
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              'You are Tonehouse AI Coach. Follow the user instrument strictly. If the instrument is "Drums", do NOT include vocals or singing.',
          },
          { role: "user", content: prompt },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? "No response.";
    }

    // First try
    let text = await generateOnce(false);

    // Validate + retry once if drift detected
    if (looksWrongInstrument(text, instrument)) {
      text = await generateOnce(true);
    }

    return NextResponse.json({ text, videos });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
