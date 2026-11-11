import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getStripe } from "./stripe";
import { selectSubscription, subscriptionSnapshot } from "./stripe-subscriptions";

export async function withBillingLock<T>(
  userId: string,
  operation: (db: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (db) => {
    // Serialize checkout and webhook writes for the same user across instances.
    await db.$executeRaw`SELECT pg_advisory_xact_lock(12736, hashtext(${userId}))`;
    return operation(db);
  }, { maxWait: 5000, timeout: 45000 });
}

export async function syncStripeSubscription(db: Prisma.TransactionClient, userId: string, customerId: string) {
  const stripe = getStripe();
  const subscriptions = [];
  for await (const subscription of stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 })) {
    subscriptions.push(subscription);
  }

  const subscription = selectSubscription(subscriptions);
  if (!subscription) return null;

  const snapshot = subscriptionSnapshot(subscription, process.env.STRIPE_PRICE_ID);
  await db.subscription.upsert({
    where: { userId },
    create: { userId, ...snapshot },
    update: snapshot,
  });
  return subscription;
}
