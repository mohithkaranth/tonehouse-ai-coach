import { prisma } from "@/lib/prisma";

type HasFullAccessInput = {
  userId?: string;
  email?: string | null;
};

export async function hasFullAccess({ userId, email }: HasFullAccessInput): Promise<boolean> {
  if (email) {
    const betaUser = await prisma.betaUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (betaUser) {
      return true;
    }
  }

  let resolvedUserId = userId;

  if (!resolvedUserId && email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    resolvedUserId = user?.id;
  }

  if (!resolvedUserId) {
    return false;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: resolvedUserId },
    select: { status: true },
  });

  if (!subscription) {
    return false;
  }

  return ["trialing", "active"].includes(subscription.status);
}
