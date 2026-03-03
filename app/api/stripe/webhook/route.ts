import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function toDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: toDate(subscription.current_period_end),
      trialEnd: toDate(subscription.trial_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: toDate(subscription.current_period_end),
      trialEnd: toDate(subscription.trial_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook configuration error" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
