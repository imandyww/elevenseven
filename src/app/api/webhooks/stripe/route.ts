import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { appendLedgerEntry, getWalletForOrg, writeAuditLog } from "@/lib/credits";

/**
 * Stripe webhook — the ONLY code path that credits a wallet.
 *
 * Idempotency: StripeEvent.stripeEventId is unique and is inserted in the
 * same serializable transaction as the ledger credit, so an event is either
 * fully processed once or not at all. Replays hit the unique constraint and
 * return 200 without crediting again.
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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    // Async payment methods complete later via checkout.session.async_payment_succeeded;
    // out of scope for card-only bundles.
    return NextResponse.json({ received: true, ignored: "payment_status != paid" });
  }

  const organizationId = session.metadata?.organization_id;
  const creditsCents = Number.parseInt(session.metadata?.credits_cents ?? "", 10);

  // Permanent failures return 200: a 4xx/5xx would make Stripe retry an
  // event that can never succeed.
  if (!organizationId || !Number.isInteger(creditsCents) || creditsCents <= 0) {
    console.error("[webhook] missing/invalid metadata on session", session.id);
    return NextResponse.json({ received: true, ignored: "invalid metadata" });
  }

  const wallet = await getWalletForOrg(organizationId);
  if (!wallet) {
    console.error("[webhook] no wallet for organization", organizationId);
    return NextResponse.json({ received: true, ignored: "unknown organization" });
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.stripeEvent.create({
          data: {
            stripeEventId: event.id,
            type: event.type,
            rawJson: rawBody,
          },
        });

        await appendLedgerEntry(
          {
            walletId: wallet.id,
            organizationId,
            type: "credit",
            amountCents: creditsCents,
            source: "stripe_checkout",
            externalRef: session.id,
            idempotencyKey: `stripe:${event.id}`,
          },
          tx,
        );

        await writeAuditLog(
          {
            organizationId,
            actorType: "system",
            action: "wallet.credited",
            metadata: {
              stripe_event_id: event.id,
              checkout_session_id: session.id,
              bundle: session.metadata?.bundle,
              credits_cents: creditsCents,
            },
          },
          tx,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ received: true, deduped: true });
    }
    console.error("[webhook] processing failed, Stripe will retry:", e);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
