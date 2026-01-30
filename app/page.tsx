import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          Tonehouse Studio Apps
        </h1>

        <p className="mt-3 text-zinc-400">
          Internal tools for students and instructors.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {/* AI Coach Card */}
          <Link
            href="/coach"
            className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 hover:bg-zinc-900 transition"
          >
            <h2 className="text-xl font-medium">🎵 AI Practice Coach</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Generate lesson plans, warmups, grooves and progress tracking.
            </p>
          </Link>

          {/* Guitar Lessons */}
          <Link
            href="/lessons/guitar"
            className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 hover:bg-zinc-900 transition"
          >
            <h2 className="text-xl font-medium">🎸 Guitar Lessons</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Structured beginner guitar lessons with guided practice.
            </p>
          </Link>

        </div>
      </div>
    </main>
  );
}
