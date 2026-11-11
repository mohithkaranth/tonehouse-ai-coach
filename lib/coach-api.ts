import { NextResponse } from "next/server";
import { checkRateLimit } from "./api-rate-limit";
import { generatePracticePlan, readCoachInput } from "./coach-generation";
import { planToMarkdown } from "./coach-markdown";
import { fallbackVideos } from "./coach-videos";
import { requirePaidApi } from "./getUserAccessLevel";
import { buildCoachVideoQuery, searchVideos } from "./youtube";

export async function handleCoachRequest(request: Request, legacySheet = false) {
  try {
    const access = await requirePaidApi();
    if (access.response) return access.response;

    const input = await readCoachInput(request, legacySheet ? "Drums" : "Guitar");
    if (!input) {
      return NextResponse.json(
        { error: "Use a supported instrument and level, 1–7 practice days and 1–180 whole minutes per day." },
        { status: 400 },
      );
    }

    const limited = await checkRateLimit(access.email, "coach");
    if (limited) return limited;

    const [plan, recommendations] = await Promise.all([
      generatePracticePlan(input),
      legacySheet ? [] : searchVideos(buildCoachVideoQuery(input)).catch(() => {
        console.warn("Coach video search failed.");
        return [];
      }),
    ]);

    if (!plan) {
      return NextResponse.json({ error: "The Coach couldn’t generate a complete plan. Please try again." }, { status: 502 });
    }

    const videos = recommendations.length
      ? recommendations.map(({ title, youtubeId }) => ({ title, url: `https://www.youtube.com/watch?v=${youtubeId}` }))
      : fallbackVideos(input.instrument);

    return NextResponse.json(legacySheet
      ? { text: planToMarkdown(plan), videos }
      : { ok: true, plan, videos });
  } catch (error) {
    console.error("Coach request failed", { name: error instanceof Error ? error.name : "Unknown" });
    return NextResponse.json({ error: "The Coach is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
