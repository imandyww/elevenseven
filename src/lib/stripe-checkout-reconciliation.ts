import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { appendLedgerEntry, getWalletForOrg, writeAuditLog } from "./credits";
import { prisma } from "./db";
import { getStripe } from "./stripe";
import { retrySerializable } from "./tx";

export type ReconcileStatus =
  | "credited"
  | "deduped"
  | "expired"
  | "ignored"
  | "unpaid";

export interface ReconcilePaidCheckoutInput {
  session: Stripe.Checkout.Session;
  stripeEvent?: {
    id: string;
    type: string;
    rawJson: string;
  };
  source: "stripe_webhook" | "manual_sync";
}

export interface ReconcilePaidCheckoutResult {
  status: ReconcileStatus;
  session_id: string;
  organization_id?: string;
  credits_cents?: number;
  reason?: string;
}

function positiveInteger(value: string | number | null | undefined): number | null {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function customerId(session: Stripe.Checkout.Session): string | undefined {
  return typeof session.customer === "string" ? session.customer : undefined;
}

async function markRelatedRecordsPaid({
  organizationId,
  session,
  creditsCents,
  fundingRequestId,
  standingOrderId,
  stripeCustomerId,
  tx,
}: {
  organizationId: string;
  session: Stripe.Checkout.Session;
  creditsCents: number;
  fundingRequestId?: string;
  standingOrderId?: string;
  stripeCustomerId?: string;
  tx: Prisma.TransactionClient;
}) {
  await tx.checkoutIntent.updateMany({
    where: { stripeSessionId: session.id },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripeCustomerId,
    },
  });

  if (stripeCustomerId) {
    await tx.organization.updateMany({
      where: { id: organizationId, stripeCustomerId: null },
      data: { stripeCustomerId },
    });
  }

  if (fundingRequestId) {
    await tx.fundingRequest.updateMany({
      where: { id: fundingRequestId, organizationId },
      data: { status: "funded" },
    });

    await writeAuditLog(
      {
        organizationId,
        actorType: "system",
        action: "funding_request.funded",
        metadata: {
          funding_request_id: fundingRequestId,
          checkout_session_id: session.id,
          credits_cents: creditsCents,
        },
      },
      tx,
    );
  }

  if (standingOrderId) {
    await writeAuditLog(
      {
        organizationId,
        actorType: "system",
        action: "standing_order.wallet_funded",
        metadata: {
          standing_order_id: standingOrderId,
          checkout_session_id: session.id,
          credits_cents: creditsCents,
        },
      },
      tx,
    );
  }
}

export async function reconcilePaidCheckoutSession(
  input: ReconcilePaidCheckoutInput,
): Promise<ReconcilePaidCheckoutResult> {
  const { session, stripeEvent, source } = input;

  if (session.payment_status !== "paid") {
    return {
      status: "ignored",
      session_id: session.id,
      reason: "payment_status != paid",
    };
  }

  const localIntent = await prisma.checkoutIntent.findUnique({
    where: { stripeSessionId: session.id },
  });
  const organizationId =
    session.metadata?.organization_id ?? localIntent?.organizationId;
  const creditsCents =
    positiveInteger(session.metadata?.credits_cents) ?? localIntent?.creditsCents;
  const fundingRequestId =
    session.metadata?.funding_request_id ?? localIntent?.fundingRequestId ?? undefined;
  const standingOrderId =
    session.metadata?.standing_order_id ?? localIntent?.standingOrderId ?? undefined;
  const stripeCustomerId = customerId(session) ?? localIntent?.stripeCustomerId ?? undefined;

  if (!organizationId || !creditsCents) {
    return {
      status: "ignored",
      session_id: session.id,
      reason: "missing organization or credits metadata",
    };
  }

  const wallet = await getWalletForOrg(organizationId);
  if (!wallet) {
    return {
      status: "ignored",
      session_id: session.id,
      organization_id: organizationId,
      credits_cents: creditsCents,
      reason: "unknown organization wallet",
    };
  }

  try {
    return await retrySerializable(() =>
      prisma.$transaction(
      async (tx) => {
        if (stripeEvent) {
          await tx.stripeEvent.create({
            data: {
              stripeEventId: stripeEvent.id,
              type: stripeEvent.type,
              rawJson: stripeEvent.rawJson,
            },
          });
        }

        const existingCredit = await tx.ledgerEntry.findFirst({
          where: {
            walletId: wallet.id,
            type: "credit",
            source: "stripe_checkout",
            externalRef: session.id,
          },
          select: { id: true },
        });

        if (existingCredit) {
          await markRelatedRecordsPaid({
            organizationId,
            session,
            creditsCents,
            fundingRequestId,
            standingOrderId,
            stripeCustomerId,
            tx,
          });

          return {
            status: "deduped" as const,
            session_id: session.id,
            organization_id: organizationId,
            credits_cents: creditsCents,
            reason: "checkout session already credited",
          };
        }

        await appendLedgerEntry(
          {
            walletId: wallet.id,
            organizationId,
            type: "credit",
            amountCents: creditsCents,
            source: "stripe_checkout",
            externalRef: session.id,
            idempotencyKey: `stripe_checkout:${session.id}`,
          },
          tx,
        );

        await writeAuditLog(
          {
            organizationId,
            actorType: "system",
            action: "wallet.credited",
            metadata: {
              stripe_event_id: stripeEvent?.id,
              checkout_session_id: session.id,
              bundle: session.metadata?.bundle ?? localIntent?.bundleId,
              credits_cents: creditsCents,
              source,
            },
          },
          tx,
        );

        await markRelatedRecordsPaid({
          organizationId,
          session,
          creditsCents,
          fundingRequestId,
          standingOrderId,
          stripeCustomerId,
          tx,
        });

        return {
          status: "credited" as const,
          session_id: session.id,
          organization_id: organizationId,
          credits_cents: creditsCents,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        status: "deduped",
        session_id: session.id,
        organization_id: organizationId,
        credits_cents: creditsCents,
        reason: "unique idempotency constraint already processed this checkout",
      };
    }
    throw e;
  }
}

export async function syncOpenCheckoutIntentsWithStripe(limit = 25) {
  const intents = await prisma.checkoutIntent.findMany({
    where: { status: "open" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });
  const stripe = getStripe();
  const results: ReconcilePaidCheckoutResult[] = [];

  for (const intent of intents) {
    try {
      const session = await stripe.checkout.sessions.retrieve(intent.stripeSessionId);

      if (session.status === "expired") {
        await prisma.checkoutIntent.updateMany({
          where: { id: intent.id, status: "open" },
          data: { status: "expired" },
        });
        results.push({
          status: "expired",
          session_id: session.id,
          organization_id: intent.organizationId,
          credits_cents: intent.creditsCents,
        });
        continue;
      }

      if (session.payment_status === "paid") {
        results.push(
          await reconcilePaidCheckoutSession({
            session,
            source: "manual_sync",
          }),
        );
        continue;
      }

      results.push({
        status: "unpaid",
        session_id: session.id,
        organization_id: intent.organizationId,
        credits_cents: intent.creditsCents,
        reason: `payment_status=${session.payment_status}`,
      });
    } catch (e) {
      results.push({
        status: "ignored",
        session_id: intent.stripeSessionId,
        organization_id: intent.organizationId,
        credits_cents: intent.creditsCents,
        reason: e instanceof Error ? e.message : "Stripe sync failed",
      });
    }
  }

  return {
    checked_count: intents.length,
    credited_count: results.filter((result) => result.status === "credited").length,
    deduped_count: results.filter((result) => result.status === "deduped").length,
    expired_count: results.filter((result) => result.status === "expired").length,
    unpaid_count: results.filter((result) => result.status === "unpaid").length,
    ignored_count: results.filter((result) => result.status === "ignored").length,
    results,
  };
}
