import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  event: vi.fn(),
  user: vi.fn(),
  subscriptionList: vi.fn(),
  upsert: vi.fn(),
  lock: vi.fn(),
  session: vi.fn(),
  membership: vi.fn(),
  account: vi.fn(),
  listCheckout: vi.fn(),
  createCheckout: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/hasFullAccess", () => ({ getMembership: mocks.membership }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.user },
    $transaction: (run: (db: unknown) => unknown) => run({
      $executeRaw: mocks.lock,
      user: { findUniqueOrThrow: mocks.account },
      subscription: { upsert: mocks.upsert },
    }),
  },
}));
vi.mock("@/lib/stripe", () => ({
  billingUrl: (path: string) => new URL(path, "https://coach.example").toString(),
  getStripe: () => ({
    webhooks: { constructEvent: mocks.event },
    subscriptions: { list: mocks.subscriptionList },
    checkout: { sessions: { list: mocks.listCheckout, create: mocks.createCheckout } },
  }),
}));

import { POST as checkout } from "@/app/api/stripe/checkout/route";
import { POST as webhook } from "@/app/api/stripe/webhook/route";
import { selectSubscription, subscriptionIsOpen, subscriptionSnapshot } from "@/lib/stripe-subscriptions";

function subscription(id: string, status: Stripe.Subscription.Status, created: number) {
  return {
    id, status, created, customer: "cus_123", trial_end: null, cancel_at_period_end: false,
    items: { data: [{ price: { id: "price_test" }, current_period_end: 1794715200 }] },
  } as Stripe.Subscription;
}

function stripeRequest() {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST", headers: { "stripe-signature": "signature" }, body: "{}",
  });
}

describe("Stripe subscriptions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "test");
    vi.stubEnv("STRIPE_SECRET_KEY", "test");
    vi.stubEnv("STRIPE_PRICE_ID", "price_test");
    mocks.listCheckout.mockReturnValue([]);
  });

  it("prefers a current subscription over a newer canceled one and reads the item billing period", () => {
    const current = subscription("sub_current", "active", 100);
    expect(selectSubscription([subscription("sub_old", "canceled", 200), current])).toBe(current);
    expect(subscriptionSnapshot(current, "price_test").currentPeriodEnd).toEqual(new Date(1794715200000));
    expect(subscriptionIsOpen("past_due")).toBe(true);
    expect(subscriptionIsOpen("canceled")).toBe(false);
  });

  it("uses current Stripe status for duplicate or out-of-order events", async () => {
    const current = subscription("sub_current", "active", 200);
    const canceled = subscription("sub_current", "canceled", 200);
    mocks.user.mockResolvedValue({ id: "member" });
    mocks.subscriptionList.mockReturnValue([current]);
    mocks.event.mockReturnValueOnce({ type: "customer.subscription.updated", data: { object: current } })
      .mockReturnValue({ type: "customer.subscription.deleted", data: { object: canceled } });

    expect((await webhook(stripeRequest())).status).toBe(200);
    expect((await webhook(stripeRequest())).status).toBe(200);
    expect((await webhook(stripeRequest())).status).toBe(200);
    expect(mocks.lock).toHaveBeenCalledTimes(3);
    expect(mocks.upsert.mock.calls.map(([args]) => args.update.status)).toEqual(["active", "active", "active"]);
  });

  it("rejects new checkout for a customer with a current subscription", async () => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    mocks.membership.mockResolvedValue({ user: { id: "member" }, isBeta: false });
    mocks.account.mockResolvedValue({ id: "member", stripeCustomerId: "cus_123" });
    mocks.subscriptionList.mockReturnValue([subscription("sub_current", "trialing", 200)]);

    expect((await checkout()).status).toBe(409);
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("returns the same open checkout session instead of creating another", async () => {
    mocks.session.mockResolvedValue({ user: { email: "student@example.com" } });
    mocks.membership.mockResolvedValue({ user: { id: "member" }, isBeta: false });
    mocks.account.mockResolvedValue({ id: "member", stripeCustomerId: "cus_123" });
    mocks.subscriptionList.mockReturnValue([]);
    mocks.listCheckout.mockReturnValue([{ mode: "subscription", url: "https://checkout.stripe.com/open" }]);

    expect(await (await checkout()).json()).toEqual({ url: "https://checkout.stripe.com/open" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("rejects a bad signature before reading billing data", async () => {
    mocks.event.mockImplementation(() => { throw new Error("bad signature"); });
    expect((await webhook(stripeRequest())).status).toBe(400);
    expect(mocks.user).not.toHaveBeenCalled();
  });
});
