import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserAccessLevel = "visitor" | "beta" | "restricted";

export async function getUserAccessLevel(): Promise<UserAccessLevel> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return "visitor";
  }

  const googleSubId =
    (session as { sub?: string }).sub ??
    (session.user as { sub?: string; id?: string } | undefined)?.sub ??
    (session.user as { sub?: string; id?: string } | undefined)?.id;

  if (!googleSubId) {
    return "restricted";
  }

  const betaUser = await prisma.betaUser.findUnique({
    where: { googleSubId },
    select: { id: true },
  });

  return betaUser ? "beta" : "restricted";
}
