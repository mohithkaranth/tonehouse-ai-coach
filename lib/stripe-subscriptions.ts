import type Stripe from "stripe";
import { subscriptionGrantsAccess } from "./subscription-access";

export function subscriptionIsOpen(status: string) {
  return status !== "canceled" && status !== "incomplete_expired";
}

export function selectSubscription(subscriptions: Stripe.Subscription[]) {
  function rank(status: Stripe.Subscription.Status) {
    if (subscriptionGrantsAccess(status)) return 2;
    return subscriptionIsOpen(status) ? 1 : 0;
  }

  return [...subscriptions].sort((a, b) =>
    rank(b.status) - rank(a.status) || b.created - a.created || b.id.localeCompare(a.id)
  )[0];
}

export function subscriptionSnapshot(subscription: Stripe.Subscription, priceId?: string) {
  const items = subscription.items.data;
  const item = items.find(({ price }) => price.id === priceId) ?? items[0];
  const periodEnd = item?.current_period_end;
  return {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
