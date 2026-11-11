import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import BillingCheckoutButton from "./BillingCheckoutButton";
import { authOptions } from "@/lib/auth";
import { getMembership } from "@/lib/hasFullAccess";
import { subscriptionIsOpen } from "@/lib/stripe-subscriptions";

type BillingPageProps = { searchParams: Promise<{ success?: string }> };

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect("/signin?callbackUrl=%2Fbilling");

  const { user, isBeta, hasFullAccess } = await getMembership(email);
  const status = user?.subscription?.status;
  const hasOpenSubscription = Boolean(status && subscriptionIsOpen(status));
  const { success } = await searchParams;
  const pending = success === "true" && !hasFullAccess && !hasOpenSubscription;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="mb-6 inline-block text-sm text-zinc-400 transition hover:text-zinc-100">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <div className="mt-8 space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
          {isBeta && <p className="text-lg font-medium">Full Access (Beta)</p>}
          {!isBeta && hasFullAccess && (
            <p className="text-lg font-medium">{status === "trialing" ? "Trial active" : "Subscription active"}</p>
          )}
          {!isBeta && hasOpenSubscription && !hasFullAccess && (
            <p>Your subscription needs attention. Open billing to review its status.</p>
          )}
          {user?.stripeCustomerId && status && <BillingCheckoutButton action="portal" />}
          {pending && (
            <div>
              <p>Stripe is confirming your subscription. Refresh this page in a moment.</p>
              <a href="/billing?success=true" className="mt-2 inline-block underline">Refresh billing</a>
            </div>
          )}
          {!isBeta && !hasOpenSubscription && !pending && <BillingCheckoutButton />}
        </div>
      </div>
    </main>
  );
}
