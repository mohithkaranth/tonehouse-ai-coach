"use client";

import Link from "next/link";
import { useState } from "react";

type Video = {
  youtubeId: string;
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
};

type Lesson = {
  id: string;
  title: string;
  summary?: string;
  practice?: string[];
};

type Nav = {
  prevId: string | null;
  nextId: string | null;
};

export default function LessonClient({
  lesson,
  nav = { prevId: null, nextId: null },
}: {
  lesson: Lesson;
  nav?: Nav;
}) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggestVideos() {
    setLoading(true);
    setError(null);

    try {
      const query = `beginner guitar ${lesson.title}`;
      const res = await fetch(
        `/api/youtube-search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setVideos(data.results || []);
    } catch {
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Top navigation */}
        <div className="mb-10 flex items-center justify-between gap-4">

          {/* Previous */}
          {nav.prevId ? (
            <Link
              href={`/lessons/${nav.prevId}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 hover:bg-zinc-800 transition"
            >
              ← Prev
            </Link>
          ) : (
            <div />
          )}

          {/* Back to list */}
          <Link
            href="/lessons/guitar"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition"
          >
            ← Back to Guitar Lessons
          </Link>

          {/* Next */}
          {nav.nextId ? (
            <Link
              href={`/lessons/${nav.nextId}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 hover:bg-zinc-800 transition"
            >
              Next →
            </Link>
          ) : (
            <div />
          )}

        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            {lesson.title}
          </h1>

          {lesson.summary && (
            <p className="mt-3 text-zinc-400">
              {lesson.summary}
            </p>
          )}
        </div>

        {/* Video */}
        {selectedVideo && (
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-medium">Lesson Video</h2>

            <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-800">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Suggest button */}
        <button
          onClick={suggestVideos}
          disabled={loading}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2 hover:bg-zinc-800 transition"
        >
          {loading ? "Searching..." : "🎬 Suggest lesson videos"}
        </button>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Video suggestions */}
        {videos.length > 0 && (
          <div className="mt-8 grid gap-4">
            {videos.map((v) => (
              <div
                key={v.youtubeId}
                onClick={() => setSelectedVideo(v)}
                className="flex cursor-pointer gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900 transition"
              >
                {v.thumbnail && (
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="h-24 w-40 rounded-md object-cover"
                  />
                )}

                <div>
                  <div className="font-medium">
                    {v.title}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {v.channelTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Practice */}
        {lesson.practice?.length ? (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-medium">
              Practice
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-zinc-300">
              {lesson.practice.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Bottom navigation */}
        <div className="mt-16 flex items-center justify-between gap-4">
          {nav.prevId ? (
            <Link
              href={`/lessons/${nav.prevId}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 hover:bg-zinc-800 transition"
            >
              ← Prev
            </Link>
          ) : (
            <div />
          )}

          {nav.nextId ? (
            <Link
              href={`/lessons/${nav.nextId}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 hover:bg-zinc-800 transition"
            >
              Next →
            </Link>
          ) : (
            <div />
          )}
        </div>

      </div>
    </main>
  );
}
