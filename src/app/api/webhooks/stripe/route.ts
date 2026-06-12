import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { reconcilePaidCheckoutSession } from "@/lib/stripe-checkout-reconciliation";

/**
 * Stripe webhook entrypoint. Wallet credits are written only after a server-side
 * Stripe session says payment_status=paid, and the shared reconciler keys
 * idempotency to the Checkout Session id so webhook/manual sync cannot double
 * credit the same payment.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await prisma.checkoutIntent
      .updateMany({
        where: { stripeSessionId: session.id, status: "open" },
        data: { status: "expired" },
      })
      .catch((e) => console.error("[webhook] checkout expiration update failed:", e));
    return NextResponse.json({ received: true, expired: session.id });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  try {
    const result = await reconcilePaidCheckoutSession({
      session,
      stripeEvent: {
        id: event.id,
        type: event.type,
        rawJson: rawBody,
      },
      source: "stripe_webhook",
    });
    return NextResponse.json({ received: true, reconciliation: result });
  } catch (e) {
    console.error("[webhook] processing failed, Stripe will retry:", e);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
