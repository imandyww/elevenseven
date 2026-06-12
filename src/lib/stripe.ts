import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazy singleton so the app boots without Stripe keys; only the billing
 * routes throw when the key is missing. Server-side only. */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (see .env.example).",
      );
    }
    client = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return client;
}
