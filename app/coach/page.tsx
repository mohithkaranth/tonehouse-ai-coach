import Link from "next/link";
import CoachForm from "../components/CoachForm";

export default function CoachPage() {
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
          🎵 Tonehouse AI Practice Coach
        </h1>

        <p className="mt-3 text-zinc-400">
          Generate structured practice plans, warmups, and focused exercises.
        </p>

        <div className="mt-10">
          <CoachForm />
        </div>
      </div>
    </main>
  );
}
