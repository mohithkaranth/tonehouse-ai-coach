import { NextResponse } from "next/server";

// Ensure Node runtime (safer for libraries, avoids edge quirks)
export const runtime = "nodejs";
// Make sure this route is always dynamic (not evaluated like a static page)
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  // Fail gracefully instead of crashing the build
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY (set it in Vercel Environment Variables)." },
      { status: 500 }
    );
  }

  // Import + client creation INSIDE the handler so build doesn't execute it
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey });

  try {
    const body = await req.json();

    // Adjust these fields to match your existing CoachForm payload
    const prompt =
      body?.prompt ||
      body?.message ||
      "Create a short practice plan with warmup, exercises, and goals.";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful music practice coach." },
        { role: "user", content: String(prompt) },
      ],
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Coach API error" },
      { status: 500 }
    );
  }
}
