import Stripe from "stripe";

const apiVersion: Stripe.StripeConfig["apiVersion"] = "2025-11-17.clover";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const globalForStripe = globalThis as unknown as {
  stripe?: Stripe;
};

export const stripe = stripeSecretKey
  ? globalForStripe.stripe ?? new Stripe(stripeSecretKey, { apiVersion })
  : undefined;

if (stripeSecretKey && process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}

export function assertStripe() {
  if (!stripe) {
    throw new Error("Stripe client is not configured. Define STRIPE_SECRET_KEY.");
  }

  return stripe;
}
