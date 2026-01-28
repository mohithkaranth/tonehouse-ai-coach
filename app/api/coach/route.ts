import OpenAI from "openai";
import { buildCoachPrompt, CoachMode } from "@/lib/prompts";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = buildCoachPrompt({
      mode: body.mode as CoachMode,
      instrument: body.instrument,
      level: body.level,
      goals: body.goals,
      genre: body.genre,
      timePerDay: body.timePerDay,
      daysPerWeek: body.daysPerWeek,
      lastSessionNotes: body.lastSessionNotes,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "You are a professional music teacher." },
        { role: "user", content: prompt }
      ],
    });

    const text = response.choices?.[0]?.message?.content ?? "No response.";
    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
