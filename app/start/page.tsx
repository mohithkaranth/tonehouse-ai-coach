import Link from "next/link";

export default function StartPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>
        </div>

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
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Patterns
            </p>
            <p className="mt-2 text-zinc-300">Small shapes you can repeat.</p>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            There are only 12 notes
          </h2>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Music looks huge at first, but the raw building blocks are small. You
            only cycle through 12 note names before they repeat higher or lower.
            That means you are not learning endless new things—you are learning
            familiar sounds in new places.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                Same notes, different spots
              </p>
              <p className="mt-2 text-zinc-300">
                On guitar and piano, the notes repeat in patterns. Your job isn’t
                memorizing everything. It’s recognizing the repeats.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                Octaves
              </p>
              <p className="mt-2 text-zinc-300">
                When a note repeats higher or lower, it’s the same note name—just
                a different octave.
              </p>
            </div>
          </div>

          {/* C to C */}
          <div className="mt-8">
            <p className="mb-2 text-sm uppercase tracking-wide text-zinc-500">
              One octave: C to C
            </p>
            <img
              src="/piano/c-to-c.jpg"
              alt="Piano keyboard showing notes from C to C"
              className="mx-auto block w-[320px] rounded-lg border border-zinc-800"
            />
            <p className="mt-2 text-sm text-zinc-400">
              Black keys are the sharps and flats.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            A scale is a safe set of notes
          </h2>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Think of a scale as a group of notes that naturally work well
            together. If you stay inside that group, your playing will usually
            sound stable and musical.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                Major vs minor vibe
              </p>
              <p className="mt-2 text-zinc-300">
                Major often feels brighter. Minor often feels darker. Your ears
                understand this faster than theory.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                Chords are stacked notes
              </p>
              <p className="mt-2 text-zinc-300">
                A chord is just a few notes played together. If your melody notes
                come from the same set, things usually sound like they belong.
              </p>
            </div>
          </div>

          {/* Combined Major/Minor */}
          <div className="mt-8">
            <p className="mb-2 text-sm uppercase tracking-wide text-zinc-500">
              Example: C Major vs C Minor
            </p>
            <img
              src="/piano/cmajorminor.png"
              alt="C Major and C Minor shown on a piano keyboard"
              className="mx-auto block w-[700px] rounded-lg border border-zinc-800"

            />
            <p className="mt-2 text-sm text-zinc-400">
              Same starting note (C). Minor shifts a few notes and often feels
              darker.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            A simple 10-minute starter routine
          </h2>
          <p className="mt-3 max-w-3xl text-zinc-300">
            No pressure. Just consistency. Do this daily for a week.
          </p>

          <ol className="mt-5 space-y-3 text-zinc-300">
            <li className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <div className="text-sm uppercase tracking-wide text-zinc-500">
                2 minutes
              </div>
              <div className="mt-1">
                Tap a steady beat. Count slowly: 1-2-3-4.
              </div>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <div className="text-sm uppercase tracking-wide text-zinc-500">
                3 minutes
              </div>
              <div className="mt-1">
                Play any 3 notes. Listen for what sounds “at rest”.
              </div>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
              <div className="text-sm uppercase tracking-wide text-zinc-500">
                5 minutes
              </div>
              <div className="mt-1">
                Pick one safe set of notes and explore slowly. No speed.
              </div>
            </li>
          </ol>
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
