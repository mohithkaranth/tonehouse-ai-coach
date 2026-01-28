import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q =
      searchParams.get("q") || "beginner guitar holding guitar";

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing YOUTUBE_API_KEY" },
        { status: 500 }
      );
    }

    const url =
      "https://www.googleapis.com/youtube/v3/search" +
      `?part=snippet&type=video&maxResults=3` +
      `&q=${encodeURIComponent(q)}` +
      `&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "YouTube API error", details: data },
        { status: response.status }
      );
    }

    const results =
      data?.items?.map((item: any) => ({
        youtubeId: item?.id?.videoId,
        title: item?.snippet?.title,
        channelTitle: item?.snippet?.channelTitle,
        thumbnail:
          item?.snippet?.thumbnails?.medium?.url ||
          item?.snippet?.thumbnails?.default?.url
      })) ?? [];

    return NextResponse.json({
      query: q,
      results
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", message: err?.message },
      { status: 500 }
    );
  }
}
