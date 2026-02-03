"use client";

import SignInOutButton from "@/components/auth/SignInOutButton";
import Link from "next/link";
import { useSession } from "next-auth/react";

type CardDef = {
  title: string;
  description: string;
  href: string;
  requiresAuth?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Card({
  title,
  description,
  href,
  disabled,
}: {
  title: string;
  description: string;
  href: string;
  disabled: boolean;
}) {
  const baseClass =
    "rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition";
  const enabledClass = "hover:bg-zinc-900";
  const disabledClass =
    "opacity-60 cursor-not-allowed select-none hover:bg-zinc-900/50";

  const inner = (
    <div className={cn(baseClass, disabled ? disabledClass : enabledClass)}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-medium">{title}</h2>

        {disabled ? (
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
            🔒 Locked
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-zinc-400">{description}</p>

      {disabled ? (
        <p className="mt-4 text-xs text-zinc-500">
          Sign in to unlock this feature.
        </p>
      ) : null}
    </div>
  );

  // 🔑 CHANGE STARTS HERE
  if (disabled) {
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(href)}`}
        className="block"
      >
        {inner}
      </Link>
    );
  }
  // 🔑 CHANGE ENDS HERE

  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}

export default function HomePage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const cards: CardDef[] = [
    {
      title: "🎵 AI Practice Coach",
      description:
        "Generate lesson plans, warmups, grooves and progress tracking.",
      href: "/coach",
      requiresAuth: true,
    },
    {
      title: "🎸 Guitar Lessons",
      description: "Structured beginner guitar lessons with guided practice.",
      href: "/lessons/guitar",
      requiresAuth: true,
    },
    {
      title: "🎶 Backing Track Finder",
      description: "Find YouTube backing tracks by key, style and tempo.",
      href: "/backing-tracks",
      requiresAuth: false,
    },
    {
      title: "🎧 Ear Training",
      description: "Intervals, chords, and progressions.",
      href: "/ear-training",
      requiresAuth: true,
    },
    {
      title: "🎹 Chord & Scale Finder",
      description: "Explore chords and scales for guitar, bass, and keyboards.",
      href: "/finder",
      requiresAuth: false,
    },
    {
      title: "🎼 Chord Progressions",
      description: "Generate common progressions by key and style.",
      href: "/progressions",
      requiresAuth: false,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Tonehouse Studio Apps
            </h1>

            <p className="mt-4 text-zinc-400">
              Find your innermost rockstar 🎸
            </p>

            <div className="mt-4 flex gap-3 text-lg text-zinc-500">
              <span title="Practice">🎸</span>
              <span title="Rhythm">🥁</span>
              <span title="Harmony">🎹</span>
              <span title="Ear Training">🎧</span>
              <span title="Theory">🎼</span>
            </div>

            <div className="mt-4">
              {isLoggedIn ? (
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200">
                  ✅ Signed in
                </span>
              ) : (
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
                  🔒 Sign in to unlock more
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 sm:mt-0">
            <SignInOutButton />
          </div>
        </div>

        <div className="mt-10 mb-10 h-px bg-zinc-800" />

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <Card
              key={c.href}
              title={c.title}
              description={c.description}
              href={c.href}
              disabled={Boolean(c.requiresAuth) && !isLoggedIn}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
