import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/api-rate-limit";
import { requirePaidApi } from "@/lib/getUserAccessLevel";
import { normalizeVideoQuery, searchVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  try {
    const access = await requirePaidApi();
    if (access.response) return access.response;

    const query = normalizeVideoQuery(new URL(request.url).searchParams.get("q") || "beginner guitar holding guitar");
    if (!query) return NextResponse.json({ results: [] });

    const limited = await checkRateLimit(access.email, "youtube");
    if (limited) return limited;

    return NextResponse.json({ query, results: await searchVideos(query) });
  } catch {
    console.warn("Lesson video search failed.");
    return NextResponse.json({ error: "Videos are temporarily unavailable." }, { status: 503 });
  }
}
