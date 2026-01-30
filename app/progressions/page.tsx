import Link from "next/link";
import ProgressionsClient from "@/components/progressions/ProgressionsClient";

export default function ProgressionsPage() {
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
          <h1 className="text-4xl font-semibold tracking-tight">Chord Progressions Generator</h1>
          <p className="mt-3 text-zinc-400">
            Generate common chord progressions for guitar, bass, and keyboards by key, style, and
            length.
          </p>
        </div>

        <ProgressionsClient />
      </div>
    </main>
  );
}
