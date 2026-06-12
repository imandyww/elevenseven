import { createHash } from "crypto";
import { Prisma, type StandingOrder } from "@prisma/client";
import { z } from "zod";
import { ApiError } from "./api-errors";
import type { AuthedAgent } from "./agent-auth";
import { startOfUtcDay, writeAuditLog } from "./credits";
import { prisma } from "./db";
import { priceCents } from "./money";
import { getProduct } from "./products";
import { allowedCategories, blockedSkus } from "./policy";
import { absoluteUrl } from "./site";
import { processPurchase } from "./purchases";

export const standingOrderRequestSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(31).default(1),
  max_total_cents: z.number().int().positive().optional(),
  cadence: z.enum(["daily"]).default("daily"),
  reason: z.string().min(1).max(500),
});

export type StandingOrderInput = z.infer<typeof standingOrderRequestSchema>;

export interface StandingOrderResult {
  status: 200 | 201;
  body: ReturnType<typeof serializeStandingOrder>;
}

export interface StandingOrderRunResult {
  standing_order_id: string;
  status: "completed" | "failed" | "skipped";
  code?: string;
  message?: string;
  order_id?: string;
  funding_request?: unknown;
}

function canonicalStandingOrderHash(request: StandingOrderInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        sku: request.sku,
        quantity: request.quantity,
        max_total_cents: request.max_total_cents ?? null,
        cadence: request.cadence,
        reason: request.reason,
      }),
    )
    .digest("hex");
}

function scopedIdempotencyKey(agentId: string, key: string): string {
  return `standing:${agentId}:${key}`;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function serializeStandingOrder(order: StandingOrder) {
  return {
    standing_order_id: order.id,
    status: order.status,
    cadence: order.cadence,
    human_url: absoluteUrl(`/standing-orders/${order.id}`),
    organization_id: order.organizationId,
    agent_id: order.agentId,
    sku: order.sku,
    product_name: order.productName,
    quantity: order.quantity,
    total_cents: order.totalCents,
    projected_daily_spend_cents: order.cadence === "daily" ? order.totalCents : 0,
    reason: order.reason,
    human_routes: {
      standing_order: absoluteUrl(`/standing-orders/${order.id}`),
      revenue_dashboard: absoluteUrl("/dashboard/revenue"),
      billing_dashboard: absoluteUrl("/dashboard/billing"),
    },
    purchase_request: {
      sku: order.sku,
      quantity: order.quantity,
      max_total_cents: order.totalCents,
      reason: `Standing order ${order.id}: ${order.reason}`,
    },
    run_endpoint: {
      method: "POST",
      path: "/api/standing-orders/run",
    },
    last_run: {
      at: order.lastRunAt?.toISOString() ?? null,
      status: order.lastRunStatus,
      order_id: order.lastOrderId,
      funding_request_id: order.lastFundingRequestId,
    },
    created_at: order.createdAt.toISOString(),
    updated_at: order.updatedAt.toISOString(),
  };
}

async function findStandingOrderReplay(
  scopedKey: string,
  requestHash: string,
): Promise<StandingOrderResult | null> {
  const existing = await prisma.standingOrder.findUnique({
    where: { idempotencyKey: scopedKey },
  });
  if (!existing) return null;
  if (existing.requestHash !== requestHash) {
    throw new ApiError(
      "duplicate_request_conflict",
      "This Idempotency-Key was already used with a different standing order body.",
    );
  }
  return { status: 200, body: serializeStandingOrder(existing) };
}

function enforceStandingOrderRequestPolicy(
  agent: AuthedAgent,
  sku: string,
  category: string,
): void {
  if (blockedSkus(agent.policy).includes(sku)) {
    throw new ApiError(
      "sku_blocked",
      `The sku "${sku}" is blocked by this agent's spending policy.`,
    );
  }

  const allowed = allowedCategories(agent.policy);
  if (allowed.length > 0 && !allowed.includes(category)) {
    throw new ApiError(
      "category_not_allowed",
      `Category "${category}" is not in this agent's allowed categories.`,
    );
  }
}

export async function createStandingOrder(
  agent: AuthedAgent,
  idempotencyKey: string,
  request: StandingOrderInput,
): Promise<StandingOrderResult> {
  const scopedKey = scopedIdempotencyKey(agent.id, idempotencyKey);
  const requestHash = canonicalStandingOrderHash(request);

  const replay = await findStandingOrderReplay(scopedKey, requestHash);
  if (replay) return replay;

  const product = getProduct(request.sku);
  if (!product) {
    throw new ApiError(
      "product_not_found",
      `No product with sku "${request.sku}". GET /api/products lists the catalog.`,
    );
  }

  enforceStandingOrderRequestPolicy(agent, product.sku, product.category);

  const totalCents = priceCents(product) * request.quantity;
  if (request.max_total_cents !== undefined && totalCents > request.max_total_cents) {
    throw new ApiError(
      "invalid_request",
      `Total ${totalCents} cents exceeds max_total_cents ${request.max_total_cents}.`,
    );
  }

  try {
    const created = await prisma.standingOrder.create({
      data: {
        organizationId: agent.organizationId,
        agentId: agent.id,
        sku: product.sku,
        productName: product.name,
        quantity: request.quantity,
        totalCents,
        cadence: request.cadence,
        reason: request.reason,
        idempotencyKey: scopedKey,
        requestHash,
      },
    });

    await writeAuditLog({
      organizationId: agent.organizationId,
      actorType: "agent",
      actorId: agent.id,
      action: "standing_order.requested",
      metadata: {
        standing_order_id: created.id,
        sku: product.sku,
        quantity: request.quantity,
        total_cents: totalCents,
        cadence: request.cadence,
      },
    });

    return { status: 201, body: serializeStandingOrder(created) };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const winner = await findStandingOrderReplay(scopedKey, requestHash);
      if (winner) return winner;
    }
    throw e;
  }
}

export async function activateStandingOrder(orderId: string): Promise<StandingOrder> {
  const order = await prisma.standingOrder.findUnique({
    where: { id: orderId },
    include: { agent: { include: { policy: true } } },
  });
  if (!order || !order.agent.policy) throw new Error("Unknown standing order.");
  if (order.status === "cancelled") {
    throw new Error("Cancelled standing orders cannot be activated.");
  }

  const monthlyEnvelopeCents = order.totalCents * 31;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.agentPolicy.update({
      where: { agentId: order.agentId },
      data: {
        dailyLimitCents: Math.max(
          order.agent.policy!.dailyLimitCents,
          order.totalCents,
        ),
        monthlyLimitCents: Math.max(
          order.agent.policy!.monthlyLimitCents,
          monthlyEnvelopeCents,
        ),
        perPurchaseLimitCents: Math.max(
          order.agent.policy!.perPurchaseLimitCents,
          order.totalCents,
        ),
        requireHumanApprovalOverCents: Math.max(
          order.agent.policy!.requireHumanApprovalOverCents,
          order.totalCents,
        ),
      },
    });

    const standingOrder = await tx.standingOrder.update({
      where: { id: order.id },
      data: { status: "active" },
    });

    await writeAuditLog(
      {
        organizationId: order.organizationId,
        actorType: "user",
        action: "standing_order.activated",
        metadata: {
          standing_order_id: order.id,
          agent_id: order.agentId,
          total_cents: order.totalCents,
          monthly_envelope_cents: monthlyEnvelopeCents,
        },
      },
      tx,
    );

    return standingOrder;
  });

  return updated;
}

export async function setStandingOrderStatus(
  orderId: string,
  status: "paused" | "cancelled",
): Promise<void> {
  const order = await prisma.standingOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Unknown standing order.");
  if (order.status === "cancelled") return;

  await prisma.standingOrder.update({
    where: { id: order.id },
    data: { status },
  });

  await writeAuditLog({
    organizationId: order.organizationId,
    actorType: "user",
    action: `standing_order.${status}`,
    metadata: {
      standing_order_id: order.id,
      previous_status: order.status,
    },
  });
}

export async function runDueStandingOrders(
  now = new Date(),
): Promise<StandingOrderRunResult[]> {
  const today = startOfUtcDay(now);
  const dueOrders = await prisma.standingOrder.findMany({
    where: {
      status: "active",
      cadence: "daily",
      OR: [{ lastRunAt: null }, { lastRunAt: { lt: today } }],
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: { agent: { include: { policy: true } } },
  });

  const results: StandingOrderRunResult[] = [];

  for (const order of dueOrders) {
    if (!order.agent.policy) {
      await prisma.standingOrder.update({
        where: { id: order.id },
        data: { lastRunAt: now, lastRunStatus: "missing_policy" },
      });
      results.push({
        standing_order_id: order.id,
        status: "skipped",
        code: "missing_policy",
        message: "Agent has no spending policy.",
      });
      continue;
    }

    if (order.agent.status !== "active") {
      await prisma.standingOrder.update({
        where: { id: order.id },
        data: { lastRunAt: now, lastRunStatus: `agent_${order.agent.status}` },
      });
      results.push({
        standing_order_id: order.id,
        status: "skipped",
        code: `agent_${order.agent.status}`,
        message: `Agent is ${order.agent.status}.`,
      });
      continue;
    }

    try {
      const purchase = await processPurchase(
        order.agent as AuthedAgent,
        `standing:${order.id}:${dayKey(now)}`,
        {
          sku: order.sku,
          quantity: order.quantity,
          max_total_cents: order.totalCents,
          reason: `Standing order ${order.id}: ${order.reason}`,
        },
      );
      const orderId =
        typeof purchase.body.order_id === "string" ? purchase.body.order_id : undefined;

      await prisma.standingOrder.update({
        where: { id: order.id },
        data: {
          lastRunAt: now,
          lastRunStatus: "completed",
          lastOrderId: orderId,
          lastFundingRequestId: null,
        },
      });

      results.push({
        standing_order_id: order.id,
        status: "completed",
        order_id: orderId,
      });
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "runner_error";
      const message = e instanceof Error ? e.message : "Standing order run failed.";
      const fundingRequest =
        e instanceof ApiError ? e.details?.funding_request : undefined;
      const fundingRequestId =
        typeof fundingRequest === "object" &&
        fundingRequest !== null &&
        "funding_request_id" in fundingRequest &&
        typeof fundingRequest.funding_request_id === "string"
          ? fundingRequest.funding_request_id
          : undefined;

      await prisma.standingOrder.update({
        where: { id: order.id },
        data: {
          lastRunAt: now,
          lastRunStatus: code,
          lastFundingRequestId: fundingRequestId,
        },
      });

      results.push({
        standing_order_id: order.id,
        status: "failed",
        code,
        message,
        funding_request: fundingRequest,
      });
    }
  }

  return results;
}
