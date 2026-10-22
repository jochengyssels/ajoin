import Stripe from "stripe";

let client: Stripe | null = null;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key, { appInfo: { name: "ajoin-shop" } });
  return client;
}

export const isLiveMode = () => process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
