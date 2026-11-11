import { unstable_cache } from "next/cache";
import type { CoachInput } from "./coach-plan";

type YouTubeItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url: string }; default?: { url: string } };
  };
};

export function normalizeVideoQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 160).toLowerCase();
}

export function buildCoachVideoQuery(input: CoachInput) {
  const mode = {
    practice_plan: "practice exercises",
    warmups: "warmups",
    chords: "grooves or exercises",
    next_session: "lesson",
  }[input.mode];
  return normalizeVideoQuery([input.level, input.instrument, input.genre, mode, input.goals].join(" "));
}

const cachedSearch = unstable_cache(async (query: string) => {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "3",
    regionCode: "SG",
    relevanceLanguage: "en",
    q: query,
    key: process.env.YOUTUBE_API_KEY ?? "",
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`YouTube search returned HTTP ${response.status}`);

  const data: { items?: YouTubeItem[] } = await response.json();
  return (data.items ?? []).flatMap(({ id, snippet }) => {
    const youtubeId = id?.videoId;
    if (!youtubeId || !/^[\w-]{11}$/.test(youtubeId)) return [];
    return [{
      youtubeId,
      title: snippet?.title ?? "YouTube video",
      channelTitle: snippet?.channelTitle,
      thumbnail: snippet?.thumbnails?.medium?.url ?? snippet?.thumbnails?.default?.url,
    }];
  });
}, ["youtube-search-v1"], { revalidate: 86400 });

export async function searchVideos(query: string) {
  if (!process.env.YOUTUBE_API_KEY) return [];
  return cachedSearch(normalizeVideoQuery(query));
}
