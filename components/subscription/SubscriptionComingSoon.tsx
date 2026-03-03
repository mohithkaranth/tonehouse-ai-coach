import Link from "next/link";

export default function SubscriptionComingSoon() {
  return (
    <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200">
      <p>
        <Link href="/billing" className="underline-offset-4 hover:underline">
          🎸 Subscribe to unlock all features
        </Link>
        .
      </p>
      <p className="text-zinc-400">Subscription coming soon.</p>
    </div>
  );
}
