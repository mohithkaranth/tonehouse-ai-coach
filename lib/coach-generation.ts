import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { coachInputSchema, generatedPlanSchema, validatePracticePlan, type CoachInput } from "./coach-plan";
import { buildCoachPrompt } from "./prompts";

export async function readCoachInput(request: Request, defaultInstrument: "Guitar" | "Drums") {
  const raw = await request.text();
  if (raw.length > 12000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const result = coachInputSchema.safeParse({ instrument: defaultInstrument, ...data });
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function generatePracticePlan(input: CoachInput) {
  const client = new OpenAI({ timeout: 20000, maxRetries: 0 });

  for (const retry of [false, true]) {
    const response = await client.responses.create({
      model: process.env.OPENAI_COACH_MODEL || "gpt-6-luna",
      instructions: buildCoachPrompt(input, retry),
      input: JSON.stringify(input),
      text: { format: zodTextFormat(generatedPlanSchema, "practice_plan") },
      max_output_tokens: 4000,
      store: false,
    });

    if (response.status !== "completed") continue;
    const text = response.output_text;
    if (!text) return null;

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }

    const plan = validatePracticePlan(data, input);
    if (plan) return plan;
  }
  return null;
}
