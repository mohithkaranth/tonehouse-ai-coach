"use client";

import Image from "next/image";
import Link from "next/link";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";

type CardDef = {
  title: string;
  description: string;
  href: string;
  requiresAuth?: boolean;
  imageSrc?: string;
  imageAlt?: string;
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
      } catch {
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
  imageSrc,
  imageAlt,
}: {
  title: string;
  description: string;
  href: string;
  disabled: boolean;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const baseClass =
    "rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition";
  const enabledClass = "hover:bg-zinc-900";
  const disabledClass =
    "opacity-60 cursor-not-allowed select-none hover:bg-zinc-900/50";

  return (
    <Link
      href={disabled ? `/signin?callbackUrl=${encodeURIComponent(href)}` : href}
      className="block"
    >
      <div className={cn(baseClass, disabled ? disabledClass : enabledClass)}>
        {imageSrc && (
          <div className="relative mb-4 h-32 w-full overflow-hidden rounded-2xl border border-zinc-800">
            <Image
              src={imageSrc}
              alt={imageAlt ?? ""}
              fill
              sizes="(min-width: 768px) 320px, 100vw"
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-transparent" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-medium">{title}</h2>
          {disabled && (
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
              🔒 Locked
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-zinc-400">{description}</p>

        {disabled && (
          <p className="mt-4 text-xs text-zinc-500">
            Sign in to unlock this feature.
          </p>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { status } = useSafeSession();
  const isLoggedIn = status === "authenticated";

  const cards: CardDef[] = [
    {
      title: "🎵 AI Practice Coach",
      description:
        "Generate lesson plans, warmups, grooves and progress tracking.",
      href: "/coach",
      requiresAuth: true,
      imageSrc: "/home/coach.jpg",
      imageAlt: "AI practice coach",
    },
    {
      title: "🎸 Guitar Lessons",
      description: "Structured beginner guitar lessons with guided practice.",
      href: "/lessons/guitar",
      requiresAuth: true,
      imageSrc: "/home/guitar-lessons.jpg",
      imageAlt: "Guitar lessons",
    },
    {
      title: "Start Music from Zero",
      description: "No theory. No jargon. Just the basics that matter.",
      href: "/start",
      requiresAuth: false,
    },
    {
      title: "🎶 Backing Track Finder",
      description: "Find YouTube backing tracks by key, style and tempo.",
      href: "/backing-tracks",
      requiresAuth: false,
      imageSrc: "/home/backing-tracks.jpg",
      imageAlt: "Backing track finder",
    },
    {
      title: "🎧 Ear Training",
      description: "Intervals, chords, and progressions.",
      href: "/ear-training",
      requiresAuth: true,
      imageSrc: "/home/ear-training.jpg",
      imageAlt: "Ear training",
    },
    {
      title: "🎹 Chord & Scale Finder",
      description: "Explore chords and scales for guitar, bass, and keyboards.",
      href: "/finder",
      requiresAuth: false,
      imageSrc: "/home/finder.jpg",
      imageAlt: "Chord and scale finder",
    },
    {
      title: "🎼 Chord Progressions",
      description: "Generate common progressions by key and style.",
      href: "/progressions",
      requiresAuth: false,
      imageSrc: "/home/progressions.jpg",
      imageAlt: "Chord progressions",
    },
  ];

  return (
    <main className="relative min-h-screen">
      {/* Home-only hero background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/home/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-950" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Tonehouse Studio Apps
          </h1>
          <p className="mt-3 text-zinc-400">
            Practice and learning tools for modern musicians.
          </p>
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
              imageSrc={c.imageSrc}
              imageAlt={c.imageAlt}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
