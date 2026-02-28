import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export type UserAccessLevel = "visitor" | "beta" | "restricted";

export async function getUserAccessLevel(): Promise<UserAccessLevel> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return "visitor";
  }

  const googleSubId =
    (session as { sub?: string }).sub ??
    (session.user as { id?: string }).id ??
    null;

  if (!googleSubId) {
    return "restricted";
  }

  const betaUsers = await prisma.$queryRaw<Array<{ googleSubId: string }>>`
    SELECT "googleSubId"
    FROM "BetaUser"
    WHERE "googleSubId" = ${googleSubId}
    LIMIT 1
  `;

  return betaUsers.length > 0 ? "beta" : "restricted";
}
