import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Tonehouse AI Coach",
  description:
    "Learn about Tonehouse Studios in Singapore and the Tonehouse AI Coach app built to help musicians practice better.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-zinc-100"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">About</h1>

      <div className="mt-6">
        <Image
          src="/about/tonehouse-studio.jpg"
          alt="Tonehouse Studios in Singapore"
          width={1400}
          height={788}
          className="w-full rounded-2xl border border-zinc-800 object-cover"
          priority
        />
      </div>

      <div className="mt-8 space-y-6">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            About Tonehouse Studios
          </h2>

          <p className="mt-4 text-zinc-300">
            From boardrooms to bandstands — turning musical passion into studio
            excellence.
          </p>

          <p className="mt-4 text-zinc-300">
            Valery and Mohith built their careers in the corporate world — Valery
            in finance and Mohith in IT and data analytics. But long before
            boardrooms and balance sheets, they were musicians first.
          </p>

          <p className="mt-4 text-zinc-300">
            They met not in an office, but on stage — performing in the same band
            where precision, timing, and feel mattered more than titles.
          </p>

          <p className="mt-4 text-zinc-300">
            What connected them was simple: a belief that sound should not just be
            heard — it should be felt.
          </p>

          <p className="mt-4 text-zinc-300">
            After years of balancing corporate careers with late-night rehearsals,
            they decided to combine discipline with creativity. They acquired
            Tonehouse Studios and transformed it from a rehearsal room into a
            fully equipped audio-visual space for musicians, creators, and
            performers in Singapore.
          </p>

          <p className="mt-4 whitespace-pre-line text-zinc-300">
            {`Tonehouse Studios is located at Parklane Shopping Mall
35 Selegie Road, #03-09
Singapore 188307`}
          </p>

          <p className="mt-4 text-zinc-300">
            Today, Tonehouse Studios blends technical precision with musical
            instinct — a space built by musicians, for musicians.
          </p>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            About Tonehouse AI Coach
          </h2>

          <p className="mt-4 text-zinc-300">
            Tonehouse AI Coach extends the same philosophy into the digital world.
          </p>

          <p className="mt-4 text-zinc-300">
            Built by Mohith, the app applies structure, systems thinking, and
            consistency to something many musicians struggle with: effective
            practice.
          </p>

          <p className="mt-4 text-zinc-300">
            Instead of random playing, the AI Coach generates structured practice
            plans, guided exercises, and learning pathways tailored to the
            musician’s goals.
          </p>

          <p className="mt-4 text-zinc-300">
            The objective is simple: clarity, consistency, and measurable
            improvement.
          </p>

          <p className="mt-4 text-zinc-300">
            Tonehouse AI Coach is not about shortcuts — it is about practicing
            smarter.
          </p>
        </article>
      </div>
    </section>
  );
}
