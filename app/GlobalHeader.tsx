"use client";

import { signOut, useSession } from "next-auth/react";

export default function GlobalHeader() {
  const { status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <header className="flex items-center justify-end px-6 py-4">
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
      >
        Sign out
      </button>
    </header>
  );
}
