import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasFullAccess } from "@/lib/hasFullAccess";

export type UserAccessLevel = "visitor" | "full" | "restricted";

export async function getUserAccessLevel(): Promise<UserAccessLevel> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return "visitor";
  }

  const email = session.user.email;

  if (!email) {
    return "restricted";
  }

  const fullAccess = await hasFullAccess({ email });

  return fullAccess ? "full" : "restricted";
}
