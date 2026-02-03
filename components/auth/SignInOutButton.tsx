"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInOutButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User avatar"}
            className="h-8 w-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}

        <div className="hidden sm:block text-right">
          <div className="text-xs text-zinc-400">Signed in as</div>
          <div className="text-sm font-medium">
            {session.user.name}
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-900 hover:bg-white"
    >
      Sign in with Google
    </button>
  );
}
