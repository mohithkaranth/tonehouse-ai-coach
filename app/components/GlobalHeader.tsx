"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

type MeStats = {
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
};

function fmt(iso?: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function GlobalHeader() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const [stats, setStats] = useState<MeStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !session?.user || stats || loading) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as MeStats;
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, session, stats, loading]);

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      {status === "loading" ? (
        <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-800/60" />
      ) : session?.user ? (
        <div className="relative">
          {/* Avatar */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Account menu"
            className="group relative grid h-11 w-11 place-items-center rounded-full p-[2px]"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/80 via-purple-400/80 to-pink-400/80 opacity-80 blur-[2px] transition group-hover:opacity-100" />
            <span className="relative grid h-full w-full place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-semibold text-white backdrop-blur">
              {initials(session.user.name)}
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 text-sm text-zinc-200 shadow-xl backdrop-blur"
              onMouseLeave={() => setOpen(false)}
            >
              <div className="px-3 py-2">
                <div className="text-xs text-zinc-400">Signed in as</div>
                <div className="font-medium text-white">
                  {session.user.name}
                </div>
                {session.user.email && (
                  <div className="mt-0.5 text-xs text-zinc-400">
                    {session.user.email}
                  </div>
                )}
              </div>

              <div className="my-2 h-px bg-zinc-800" />

              {/* Stats */}
              <div className="px-3 py-2">
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div className="text-zinc-400">Member since</div>
                  <div className="text-right">
                    {loading ? "…" : stats ? fmt(stats.createdAt) : "—"}
                  </div>

                  <div className="text-zinc-400">Last login</div>
                  <div className="text-right">
                    {loading ? "…" : stats ? fmt(stats.lastLoginAt) : "—"}
                  </div>

                  <div className="text-zinc-400">Logins</div>
                  <div className="text-right">
                    {loading ? "…" : stats ? stats.loginCount : "—"}
                  </div>
                </div>
              </div>

              <div className="my-2 h-px bg-zinc-800" />

              <button
                onClick={() => signOut()}
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-900"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/signin"
          className="rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 backdrop-blur hover:bg-zinc-900/80 hover:text-white"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
