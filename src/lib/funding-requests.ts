import { createHash } from "crypto";
import { Prisma, type FundingRequest } from "@prisma/client";
import { z } from "zod";
import { ApiError } from "./api-errors";
import type { AuthedAgent } from "./agent-auth";
import { getBalanceCents, getWalletForOrg, writeAuditLog } from "./credits";
import { prisma } from "./db";
import { fundingHandoff, recommendBundle } from "./funding";
import { priceCents } from "./money";
import { getProduct } from "./products";
import { absoluteUrl } from "./site";

export const fundingRequestSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  max_total_cents: z.number().int().positive().optional(),
  reason: z.string().min(1).max(500),
});

export type FundingRequestInput = z.infer<typeof fundingRequestSchema>;

export interface FundingRequestResult {
  status: 200 | 201;
  body: ReturnType<typeof serializeFundingRequest>;
}

function canonicalFundingRequestHash(request: FundingRequestInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        sku: request.sku,
        quantity: request.quantity,
        max_total_cents: request.max_total_cents ?? null,
        reason: request.reason,
      }),
    )
    .digest("hex");
}

function scopedIdempotencyKey(agentId: string, key: string): string {
  return `funding:${agentId}:${key}`;
}

export function serializeFundingRequest(request: FundingRequest) {
  const handoff = fundingHandoff({
    requiredCreditsCents: request.totalCents,
    currentBalanceCents: request.currentBalanceCents,
    sku: request.sku,
    quantity: request.quantity,
    reason: request.reason ?? undefined,
    organizationId: request.organizationId,
    recommendedBundleId: request.recommendedBundleId,
    fundingRequestId: request.id,
  });

  return {
    funding_request_id: request.id,
    status: request.status,
    source: request.source,
    human_url: absoluteUrl(`/funding-requests/${request.id}`),
    organization_id: request.organizationId,
    agent_id: request.agentId,
    sku: request.sku,
    product_name: request.productName,
    quantity: request.quantity,
    total_cents: request.totalCents,
    current_balance_cents: request.currentBalanceCents,
    shortfall_cents: request.shortfallCents,
    reason: request.reason,
    recommended_bundle: handoff.recommended_bundle,
    human_routes: handoff.human_routes,
    checkout_session_request: handoff.checkout_session_request,
    created_at: request.createdAt.toISOString(),
    updated_at: request.updatedAt.toISOString(),
  };
}

async function findFundingReplay(
  scopedKey: string,
  requestHash: string,
): Promise<FundingRequestResult | null> {
  const existing = await prisma.fundingRequest.findUnique({
    where: { idempotencyKey: scopedKey },
  });
  if (!existing) return null;
  if (existing.requestHash !== requestHash) {
    throw new ApiError(
      "duplicate_request_conflict",
      "This Idempotency-Key was already used with a different funding request body.",
    );
  }
  return { status: 200, body: serializeFundingRequest(existing) };
}

export async function createFundingRequest(
  agent: AuthedAgent,
  idempotencyKey: string,
  request: FundingRequestInput,
  source: "agent_api" | "purchase_denied" = "agent_api",
): Promise<FundingRequestResult> {
  const scopedKey = scopedIdempotencyKey(agent.id, idempotencyKey);
  const requestHash = canonicalFundingRequestHash(request);

  const replay = await findFundingReplay(scopedKey, requestHash);
  if (replay) return replay;

  const product = getProduct(request.sku);
  if (!product) {
    throw new ApiError(
      "product_not_found",
      `No product with sku "${request.sku}". GET /api/products lists the catalog.`,
    );
  }

  const totalCents = priceCents(product) * request.quantity;
  if (request.max_total_cents !== undefined && totalCents > request.max_total_cents) {
    throw new ApiError(
      "invalid_request",
      `Total ${totalCents} cents exceeds max_total_cents ${request.max_total_cents}.`,
    );
  }

  const wallet = await getWalletForOrg(agent.organizationId);
  const currentBalanceCents = wallet ? await getBalanceCents(wallet.id) : 0;
  const shortfallCents = Math.max(0, totalCents - currentBalanceCents);
  const bundle = recommendBundle(shortfallCents || totalCents);

  try {
    const created = await prisma.fundingRequest.create({
      data: {
        organizationId: agent.organizationId,
        agentId: agent.id,
        sku: product.sku,
        productName: product.name,
        quantity: request.quantity,
        totalCents,
        currentBalanceCents,
        shortfallCents,
        recommendedBundleId: bundle.id,
        reason: request.reason,
        source,
        idempotencyKey: scopedKey,
        requestHash,
      },
    });

    await writeAuditLog({
      organizationId: agent.organizationId,
      actorType: "agent",
      actorId: agent.id,
      action: "funding_request.created",
      metadata: {
        funding_request_id: created.id,
        sku: product.sku,
        quantity: request.quantity,
        total_cents: totalCents,
        shortfall_cents: shortfallCents,
        recommended_bundle: bundle.id,
        source,
      },
    });

    return { status: 201, body: serializeFundingRequest(created) };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const winner = await findFundingReplay(scopedKey, requestHash);
      if (winner) return winner;
    }
    throw e;
  }
}
