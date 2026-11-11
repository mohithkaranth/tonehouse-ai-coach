import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { syncStripeSubscription, withBillingLock } from "@/lib/stripe-billing";

export const maxDuration = 55;

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing is temporarily unavailable." }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let customer: string | Stripe.Customer | Stripe.DeletedCustomer | null = null;
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      customer = event.data.object.customer;
      break;
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (event.data.object.mode === "subscription") customer = event.data.object.customer;
      break;
  }

  if (customer) {
    const customerId = typeof customer === "string" ? customer : customer.id;
    try {
      const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId }, select: { id: true } });
      if (user) {
        // The event triggers a read of current Stripe state instead of applying an older event snapshot.
        await withBillingLock(user.id, (db) => syncStripeSubscription(db, user.id, customerId));
      }
    } catch (error) {
      console.error("Stripe subscription sync failed", {
        eventId: event.id,
        name: error instanceof Error ? error.name : "Unknown",
      });
      return NextResponse.json({ error: "Subscription sync failed." }, { status: 503 });
    }
  }

  return NextResponse.json({ received: true });
}
