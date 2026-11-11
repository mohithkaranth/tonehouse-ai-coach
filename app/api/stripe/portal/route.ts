import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMembership } from "@/lib/hasFullAccess";
import { billingUrl, getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

    const { user } = await getMembership(email);
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account was found." }, { status: 404 });
    }

    const portal = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: billingUrl("/billing"),
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("Stripe portal failed", { name: error instanceof Error ? error.name : "Unknown" });
    return NextResponse.json({ error: "Unable to open the billing portal." }, { status: 503 });
  }
}
