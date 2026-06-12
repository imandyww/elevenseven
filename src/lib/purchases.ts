import { createHash, randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./db";
import { ApiError } from "./api-errors";
import type { AuthedAgent } from "./agent-auth";
import {
  agentSpendSinceCents,
  appendLedgerEntry,
  getBalanceCents,
  getWalletForOrg,
  startOfUtcDay,
  startOfUtcMonth,
  writeAuditLog,
} from "./credits";
import { priceCents } from "./money";
import { getProduct } from "./products";
import { enforcePurchasePolicy, enforceSpendLimits } from "./policy";

export const purchaseRequestSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  max_total_cents: z.number().int().positive().optional(),
  reason: z.string().min(1).max(500),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;

/** SKUs delisted from agent purchasing. None today; the code path exists so
 * a product can be retired without a schema change. */
const INACTIVE_SKUS = new Set<string>();

export interface PurchaseResult {
  /** 201 for a fresh order, 200 for an idempotent replay. */
  status: 200 | 201;
  body: Record<string, unknown>;
}

function canonicalRequestHash(body: PurchaseRequest): string {
  const canonical = JSON.stringify({
    sku: body.sku,
    quantity: body.quantity,
    max_total_cents: body.max_total_cents ?? null,
    reason: body.reason,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

async function findReplay(
  agentId: string,
  idempotencyKey: string,
  requestHash: string,
): Promise<PurchaseResult | null> {
  const existing = await prisma.order.findUnique({
    where: { agentId_idempotencyKey: { agentId, idempotencyKey } },
    include: { receipt: true },
  });
  if (!existing) return null;
  if (existing.requestHash !== requestHash) {
    throw new ApiError(
      "duplicate_request_conflict",
      "This Idempotency-Key was already used with a different request body.",
    );
  }
  return {
    status: 200,
    body: JSON.parse(existing.receipt!.receiptJson),
  };
}

/**
 * Execute an agent purchase end to end. All policy/balance checks plus the
 * order, ledger debit, receipt, entitlement, and audit log happen inside one
 * serializable transaction. Idempotent retries return the original order.
 */
export async function processPurchase(
  agent: AuthedAgent,
  idempotencyKey: string,
  request: PurchaseRequest,
): Promise<PurchaseResult> {
  const requestHash = canonicalRequestHash(request);

  const replay = await findReplay(agent.id, idempotencyKey, requestHash);
  if (replay) return replay;

  try {
    return await attemptPurchase(agent, idempotencyKey, request, requestHash);
  } catch (e) {
    // Concurrent retry hit the unique (agentId, idempotencyKey) constraint:
    // the winner's order is the canonical one — return or conflict on it.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const winner = await findReplay(agent.id, idempotencyKey, requestHash);
      if (winner) return winner;
    }
    if (e instanceof ApiError) {
      await writeAuditLog({
        organizationId: agent.organizationId,
        actorType: "agent",
        actorId: agent.id,
        action: "purchase.denied",
        metadata: {
          code: e.code,
          message: e.message,
          sku: request.sku,
          quantity: request.quantity,
          idempotency_key: idempotencyKey,
        },
      }).catch(() => {});
    }
    throw e;
  }
}

async function attemptPurchase(
  agent: AuthedAgent,
  idempotencyKey: string,
  request: PurchaseRequest,
  requestHash: string,
): Promise<PurchaseResult> {
  const product = getProduct(request.sku);
  if (!product) {
    throw new ApiError(
      "product_not_found",
      `No product with sku "${request.sku}". GET /api/products lists the catalog.`,
    );
  }
  if (INACTIVE_SKUS.has(product.sku)) {
    throw new ApiError(
      "product_inactive",
      `The product "${product.sku}" is no longer available for purchase.`,
    );
  }

  const totalCents = priceCents(product) * request.quantity;
  enforcePurchasePolicy(agent.policy, product, totalCents, request.max_total_cents);

  // Fast-fail spend check; re-verified inside the transaction below.
  const [spentToday, spentMonth] = await Promise.all([
    agentSpendSinceCents(agent.id, startOfUtcDay()),
    agentSpendSinceCents(agent.id, startOfUtcMonth()),
  ]);
  enforceSpendLimits(agent.policy, spentToday, spentMonth, totalCents);

  const wallet = await getWalletForOrg(agent.organizationId);
  if (!wallet) {
    throw new ApiError(
      "insufficient_credits",
      "This organization has no credit wallet yet. A human needs to buy Agent Credits first.",
    );
  }

  const orderId = newId("ord");
  const receiptId = newId("rcpt");
  const entitlementId = newId("ent");
  const createdAt = new Date();

  const responseBody = {
    order_id: orderId,
    agent_id: agent.id,
    status: "completed" as const,
    items: [
      {
        sku: product.sku,
        name: product.name,
        quantity: request.quantity,
        unit_price_cents: priceCents(product),
      },
    ],
    total_cents: totalCents,
    receipt: {
      receipt_id: receiptId,
      created_at: createdAt.toISOString(),
    },
    manifest: {
      upgrade_type: product.manifest.upgrade_type,
      allowed_uses: product.manifest.allowed_uses * request.quantity,
      expires: product.manifest.expires === "never" ? null : product.manifest.expires,
    },
    entitlement_id: entitlementId,
  };

  await prisma.$transaction(
    async (tx) => {
      // Re-check spend limits inside the transaction to close the gap
      // between precheck and commit.
      const [txSpentToday, txSpentMonth] = [
        await agentSpendSinceCents(agent.id, startOfUtcDay(), tx),
        await agentSpendSinceCents(agent.id, startOfUtcMonth(), tx),
      ];
      enforceSpendLimits(agent.policy, txSpentToday, txSpentMonth, totalCents);

      const balance = await getBalanceCents(wallet.id, tx);
      if (balance < totalCents) {
        throw new ApiError(
          "insufficient_credits",
          "This organization does not have enough Agent Credits for this purchase.",
        );
      }

      await tx.order.create({
        data: {
          id: orderId,
          organizationId: agent.organizationId,
          agentId: agent.id,
          totalCents,
          status: "completed",
          reason: request.reason,
          idempotencyKey,
          requestHash,
          createdAt,
          items: {
            create: {
              sku: product.sku,
              name: product.name,
              quantity: request.quantity,
              unitPriceCents: priceCents(product),
            },
          },
        },
      });

      await appendLedgerEntry(
        {
          walletId: wallet.id,
          organizationId: agent.organizationId,
          agentId: agent.id,
          orderId,
          type: "debit",
          amountCents: totalCents,
          source: "agent_purchase",
          externalRef: orderId,
          idempotencyKey: `purchase:${agent.id}:${idempotencyKey}`,
        },
        tx,
      );

      await tx.entitlement.create({
        data: {
          id: entitlementId,
          organizationId: agent.organizationId,
          agentId: agent.id,
          orderId,
          sku: product.sku,
          manifestJson: JSON.stringify(responseBody.manifest),
          allowedUses: product.manifest.allowed_uses * request.quantity,
          remainingUses: product.manifest.allowed_uses * request.quantity,
          expiresAt: null, // catalog manifests never expire today
        },
      });

      await tx.receipt.create({
        data: {
          id: receiptId,
          orderId,
          organizationId: agent.organizationId,
          agentId: agent.id,
          receiptJson: JSON.stringify(responseBody),
          createdAt,
        },
      });

      await writeAuditLog(
        {
          organizationId: agent.organizationId,
          actorType: "agent",
          actorId: agent.id,
          action: "purchase.completed",
          metadata: {
            order_id: orderId,
            sku: product.sku,
            quantity: request.quantity,
            total_cents: totalCents,
            reason: request.reason,
          },
        },
        tx,
      );
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  return { status: 201, body: responseBody };
}
