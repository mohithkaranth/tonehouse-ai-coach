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
    // Beginner-friendly fundamentals (always)
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

    const prompt = `
Create a structured ${mode.replaceAll("_", " ")} for:
- Instrument: ${instrument}
- Level: ${level}
- Genre: ${genre}
- Goals: ${goals}
- Time per day: ${timePerDay}
- Days per week: ${daysPerWeek}
- Last session notes: ${lastSessionNotes}

Requirements:
- Output in Markdown
- Use headings + bullet points
- Keep it practical and specific (timing, technique drills, session structure)
- If drums and user likes odd time signatures, include an odd-time mini-block
`;

    // Always return videos even if OpenAI key is missing
    const videos = pickVideos({ instrument, mode, goals, genre, level });

    const apiKey = process.env.OPENAI_API_KEY;

    // If no key, don't crash build or runtime: return videos + helpful error
    if (!apiKey) {
      return NextResponse.json(
        {
          text: "OPENAI_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.",
          videos,
        },
        { status: 200 }
      );
    }

    // Lazy import so Vercel build doesn't execute OpenAI init
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "You are Tonehouse AI Coach. Return an actionable practice plan in Markdown.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ?? "No response.";

    return NextResponse.json({ text, videos });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
