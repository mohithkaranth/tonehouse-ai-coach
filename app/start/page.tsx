import Link from "next/link";

export default function StartPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
      >
        ← Back
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Start Music from Zero
      </h1>
      <p className="mt-3 text-zinc-400">
        If you are brand new, this page gives you the basics in plain language.
        Learn what notes are, how scales help, and what to practice first.
      </p>

      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-medium">Notes</h2>
        <p className="mt-3 text-zinc-300">
          A note is a single sound, like one letter in music. Western music uses
          12 notes, and those 12 notes repeat in higher and lower ranges.
        </p>
        <p className="mt-3 text-zinc-300">
          A melody is a line of notes played one after another. A chord is a
          group of notes played at the same time.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-medium">Scales</h2>
        <p className="mt-3 text-zinc-300">
          A scale is a safe set of notes that sound good together. When you are
          learning, scales help you know which notes are safe to use.
        </p>
        <div className="mt-4 space-y-3 text-zinc-200">
          <p>
            <span className="font-medium">C Major:</span> C D E F G A B C
          </p>
          <p>
            <span className="font-medium">A Minor:</span> A B C D E F G A
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-medium">What to do next</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-300">
          <li>Play each note in C Major slowly and clearly.</li>
          <li>Try making a short melody with only C Major notes.</li>
          <li>Switch to A Minor and notice how the mood changes.</li>
          <li>Practice 10 minutes a day to build consistency.</li>
        </ul>
      </section>
    </main>
  );
}
