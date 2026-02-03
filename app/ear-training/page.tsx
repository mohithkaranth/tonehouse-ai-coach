import Link from "next/link";
import EarTrainingClient from "@/components/ear-training/EarTrainingClient";

export default function EarTrainingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          <span aria-hidden="true">←</span>
          Back to Home
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-semibold tracking-tight">Ear Training</h1>
          <p className="mt-3 text-zinc-400">
            Train your ears with intervals, chords, and progressions.
          </p>
        </div>

        <EarTrainingClient />
      </div>
    </main>
  );
}
