import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const betaUser = await prisma.betaUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (betaUser) {
    return NextResponse.json({ error: "already full access" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, stripeCustomerId: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `${origin}/billing?success=true`,
    cancel_url: `${origin}/billing?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
