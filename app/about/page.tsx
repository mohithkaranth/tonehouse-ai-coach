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
    <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-zinc-100"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-zinc-800">
        <div className="relative h-56 w-full md:h-72">
          <Image
            src="/about/tonehouse-studio.jpeg"
            alt="Tonehouse Studios in Singapore"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <h1 className="text-3xl font-semibold tracking-tight text-white">About</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-200 md:text-base">
              A physical studio in Singapore — and an app built to help musicians
              practice better.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-6">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            About Tonehouse Studios
          </h2>

          <div className="mt-4 space-y-4 text-zinc-300">
            <p>
              From boardrooms to bandstands — turning musical passion into studio
              excellence.
            </p>

            <p>
              Valery and Mohith built their careers in the corporate world —
              Valery in finance and Mohith in IT and data analytics. But long
              before boardrooms and balance sheets, they were musicians first.
            </p>

            <p>
              They met not in an office, but on stage — performing in the same
              band where precision, timing, and feel mattered more than titles.
            </p>

            <p>
              What connected them was simple: a belief that sound should not just
              be heard — it should be felt.
            </p>

            <p>
              After years of balancing corporate careers with late-night
              rehearsals, they decided to combine discipline with creativity.
              They acquired Tonehouse Studios and transformed it from a rehearsal
              room into a fully equipped audio-visual space for musicians,
              creators, and performers in Singapore.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300">
              <p>Located in: Parklane Shopping Mall</p>
              <p>35 Selegie Road, #03-09</p>
              <p>Singapore 188307</p>
            </div>

            <p>
              Today, Tonehouse Studios blends technical precision with musical
              instinct — a space built by musicians, for musicians.
            </p>

            <div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=35+Selegie+Rd+%2303-09+Singapore+188307"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                Get directions
              </a>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            About Tonehouse AI Coach
          </h2>

          <div className="mt-4 space-y-4 text-zinc-300">
            <p>
              Tonehouse AI Coach extends the same philosophy into the digital
              world.
            </p>

            <p>
              Built by Mohith, the app applies structure, systems thinking, and
              consistency to something many musicians struggle with: effective
              practice.
            </p>

            <p>
              Instead of random playing, the AI Coach generates structured
              practice plans, guided exercises, and learning pathways tailored to
              the musician&apos;s goals.
            </p>

            <p>
              The objective is simple: clarity, consistency, and measurable
              improvement.
            </p>

            <p>
              Tonehouse AI Coach is not about shortcuts — it is about practicing
              smarter.
            </p>

            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400 marker:text-zinc-500">
              <li>Structured practice plans</li>
              <li>Guided exercises</li>
              <li>Clear learning pathways</li>
            </ul>
          </div>
        </article>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="https://tonehouse.sg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            Visit tonehouse.sg
          </a>
          <a
            href="mailto:info@tonehouse.sg"
            className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
