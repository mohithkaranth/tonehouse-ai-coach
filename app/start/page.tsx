import Link from "next/link";

export default function StartPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        <section>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            You can start music today, even if everything feels new.
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            We will keep it simple and practical, one clear step at a time.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm uppercase tracking-wide text-zinc-500">Sound</p>
            <p className="mt-2 text-zinc-300">The note you hear right now.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm uppercase tracking-wide text-zinc-500">Time</p>
            <p className="mt-2 text-zinc-300">When a note happens.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm uppercase tracking-wide text-zinc-500">Patterns</p>
            <p className="mt-2 text-zinc-300">Small shapes you can repeat.</p>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">There are only 12 notes</h2>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Music looks huge at first, but the raw building blocks are small. You only cycle through 12
            note names before they repeat higher or lower. That means you are not learning endless new
            things—you are learning familiar sounds in new places.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">A scale is a safe set of notes</h2>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Think of a scale as a group of notes that naturally work well together. If you stay inside
            that group, your playing will usually sound stable and musical. It is a simple way to explore
            without feeling lost.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Next steps</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link
              href="/lessons/guitar"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-lg font-medium transition hover:bg-zinc-900"
            >
              Guitar lessons
            </Link>
            <Link
              href="/ear-training"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-lg font-medium transition hover:bg-zinc-900"
            >
              Ear training
            </Link>
            <Link
              href="/coach"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-lg font-medium transition hover:bg-zinc-900"
            >
              AI Practice Coach
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
