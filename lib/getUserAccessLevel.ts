import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getMembership } from "@/lib/hasFullAccess";

async function getAccess() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { level: "visitor" } as const;

  const { hasFullAccess } = await getMembership(email);
  return { level: hasFullAccess ? "full" : "restricted", email } as const;
}

export async function requirePaidPage(path: string) {
  const access = await getAccess();
  if (access.level === "visitor") {
    redirect(`/signin?callbackUrl=${encodeURIComponent(path)}`);
  }
  if (access.level === "restricted") redirect("/billing");
}

export async function requirePaidApi() {
  const access = await getAccess();
  if (access.level === "visitor") {
    return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  }
  if (access.level === "restricted") {
    return { response: NextResponse.json({ error: "A subscription or trial is required." }, { status: 403 }) };
  }
  return { email: access.email };
}
