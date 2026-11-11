import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMembership } from "@/lib/hasFullAccess";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, isBeta } = await getMembership(email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    loginCount: user.loginCount,
    isBeta,
    canManageBilling: Boolean(user.stripeCustomerId && user.subscription),
    subscriptionStatus: user.subscription?.status ?? null,
    currentPeriodEnd: user.subscription?.currentPeriodEnd?.toISOString() ?? null,
    trialEnd: user.subscription?.trialEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd ?? false,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
