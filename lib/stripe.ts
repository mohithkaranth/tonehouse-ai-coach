import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return stripeClient ??= new Stripe(key, { timeout: 8000, maxNetworkRetries: 1 });
}

export function billingUrl(path: string) {
  const origin = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
    || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://coach.tonehouse.sg");
  return new URL(path, origin).toString();
}
