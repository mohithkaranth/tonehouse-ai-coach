import Link from "next/link";
import { listLessonsByInstrument } from "@/lib/lessons";

export default function GuitarLessonsPage() {
  const lessons = listLessonsByInstrument("guitar");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">🎸 Guitar Lessons</h1>

        <div className="mt-8 grid gap-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900 transition"
            >
              <h2 className="text-lg font-medium">{lesson.title}</h2>
              {lesson.summary && (
                <p className="mt-2 text-sm text-zinc-400">
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
