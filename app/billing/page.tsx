import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import BillingCheckoutButton from "./BillingCheckoutButton";
import { authOptions } from "@/lib/auth";
import { hasFullAccess } from "@/lib/hasFullAccess";
import { prisma } from "@/lib/prisma";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/api/auth/signin?callbackUrl=/billing");
  }

  const betaUser = await prisma.betaUser.findUnique({
    where: { email },
    select: { id: true },
  });

  const fullAccess = await hasFullAccess({ email });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-400 transition hover:text-zinc-100"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
          {betaUser ? (
            <p className="text-lg font-medium">Full Access (Beta)</p>
          ) : fullAccess ? (
            <p className="text-lg font-medium">Subscription Active</p>
          ) : (
            <BillingCheckoutButton />
          )}
        </div>
      </div>
    </main>
  );
}
