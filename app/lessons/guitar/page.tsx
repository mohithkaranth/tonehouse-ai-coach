import Link from "next/link";
import { listLessonsByInstrument } from "@/lib/lessons";

export default function GuitarLessonsPage() {
  const lessons = listLessonsByInstrument("guitar");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">
          🎸 Guitar Lessons
        </h1>

        <div className="mt-8 space-y-2">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-all duration-200 hover:border-zinc-600"
            >
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{lesson.title}</h2>

              {lesson.summary && (
                <p className="mt-2 text-sm text-zinc-300">
                  {lesson.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
