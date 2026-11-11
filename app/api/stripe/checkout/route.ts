import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMembership } from "@/lib/hasFullAccess";
import { billingUrl, getStripe } from "@/lib/stripe";
import { syncStripeSubscription, withBillingLock } from "@/lib/stripe-billing";
import { subscriptionIsOpen } from "@/lib/stripe-subscriptions";

export const maxDuration = 55;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

    const { isBeta, user } = await getMembership(email);
    if (isBeta) return NextResponse.json({ error: "Your beta account already has full access." }, { status: 409 });
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error("Missing STRIPE_PRICE_ID");
    const stripe = getStripe();

    const result = await withBillingLock(user.id, async (db) => {
      const account = await db.user.findUniqueOrThrow({ where: { id: user.id } });
      let customerId = account.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: account.email,
          name: account.name ?? undefined,
          metadata: { userId: account.id },
        }, { idempotencyKey: `tonehouse-customer-${account.id}` });
        customerId = customer.id;
        await db.user.update({ where: { id: account.id }, data: { stripeCustomerId: customerId } });
      }

      // Inspect open Checkout before checking subscriptions, since a session can complete between reads.
      let openCheckoutUrl: string | undefined;
      for await (const checkout of stripe.checkout.sessions.list({ customer: customerId, status: "open" })) {
        if (checkout.mode === "subscription" && checkout.url) {
          openCheckoutUrl = checkout.url;
          break;
        }
      }

      const current = await syncStripeSubscription(db, account.id, customerId);
      if (current && subscriptionIsOpen(current.status)) return { existing: true } as const;
      if (openCheckoutUrl) return { url: openCheckoutUrl };

      const checkout = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { tonehouseUserId: account.id },
        subscription_data: { trial_period_days: 7 },
        success_url: billingUrl("/billing?success=true"),
        cancel_url: billingUrl("/billing?canceled=true"),
      });
      return { url: checkout.url };
    });

    if ("existing" in result) {
      return NextResponse.json(
        { error: "You already have a subscription. Open billing to manage it." },
        { status: 409 },
      );
    }
    if (!result.url) throw new Error("Stripe checkout URL missing");
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Checkout failed", { name: error instanceof Error ? error.name : "Unknown" });
    return NextResponse.json({ error: "Checkout is temporarily unavailable." }, { status: 503 });
  }
}
