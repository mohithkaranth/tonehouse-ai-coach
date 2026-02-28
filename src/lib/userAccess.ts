import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserAccessLevel = "visitor" | "beta" | "restricted";

export async function getUserAccessLevel(): Promise<UserAccessLevel> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return "visitor";
  }

  const email = session.user?.email;

  if (!email) {
    return "restricted";
  }

  const betaUser = await prisma.betaUser.findUnique({
    where: { email },
    select: { id: true },
  });

  return betaUser ? "beta" : "restricted";
}
