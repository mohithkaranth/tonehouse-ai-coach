"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-md px-6 py-20">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Sign in to Tonehouse
          </h1>

          <p className="mt-3 text-zinc-400">
            Unlock AI Coach, Guitar Lessons, and more.
          </p>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-medium transition hover:bg-zinc-900"
            >
              Continue with Google
            </button>

            <Link
              href="/"
              className="block w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-center text-sm font-medium transition hover:bg-zinc-900"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
