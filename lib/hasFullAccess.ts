import { prisma } from "@/lib/prisma";
import { subscriptionGrantsAccess } from "@/lib/subscription-access";

export async function getMembership(email: string) {
  const [betaUser, user] = await Promise.all([
    prisma.betaUser.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
        stripeCustomerId: true,
        subscription: {
          select: { status: true, currentPeriodEnd: true, trialEnd: true, cancelAtPeriodEnd: true },
        },
      },
    }),
  ]);

  return {
    user,
    isBeta: Boolean(betaUser),
    hasFullAccess: Boolean(betaUser) || subscriptionGrantsAccess(user?.subscription?.status),
  };
}

export async function hasFullAccess({ email }: { email?: string | null }) {
  return email ? (await getMembership(email)).hasFullAccess : false;
}
