"use client";

import SignInOutButton from "@/components/auth/SignInOutButton";
import Link from "next/link";
import { getSession, type Session } from "next-auth/react";
import { useEffect, useState } from "react";

type CardDef = {
  title: string;
  description: string;
  href: string;
  requiresAuth?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

function useSafeSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const data = await getSession();
        if (!isMounted) return;
        setSession(data);
        setStatus(data ? "authenticated" : "unauthenticated");
      } catch (error) {
        if (!isMounted) return;
        setSession(null);
        setStatus("error");
        setAuthError("Auth not configured in this environment.");
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return { session, status, authError };
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
  const { session, status, authError } = useSafeSession();
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
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Tonehouse Studio Apps
            </h1>

            <p className="mt-3 text-zinc-400">
              Practice and learning tools for modern musicians.
            </p>
          </div>

          <div className="mt-2 sm:mt-0">
            <SignInOutButton
              session={session}
              status={status}
              authError={authError}
            />
          </div>
        </div>

        <div className="mt-8 mb-8 h-px bg-zinc-800" />

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
