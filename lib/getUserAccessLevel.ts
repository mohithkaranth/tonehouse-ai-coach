import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export type UserAccessLevel = "visitor" | "beta" | "restricted";

export async function getUserAccessLevel(): Promise<UserAccessLevel> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return "visitor";
  }

  const email = session.user.email;

  console.log("LOGIN EMAIL =", email);

  if (!email) {
    return "restricted";
  }

  const betaUser = await prisma.betaUser.findUnique({
    where: { email },
    select: { id: true },
  });

  return betaUser ? "beta" : "restricted";
}