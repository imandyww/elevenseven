import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ApiError, errorResponse, internalErrorResponse } from "@/lib/api-errors";
import { authenticateAgent } from "@/lib/agent-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/credits";

function entitlementJson(ent: {
  id: string;
  sku: string;
  manifestJson: string;
  allowedUses: number;
  remainingUses: number;
  consumedAt: Date | null;
}) {
  return {
    entitlement_id: ent.id,
    sku: ent.sku,
    manifest: JSON.parse(ent.manifestJson),
    allowed_uses: ent.allowedUses,
    remaining_uses: ent.remainingUses,
    consumed_at: ent.consumedAt?.toISOString() ?? null,
  };
}

/**
 * POST /v1/entitlements/:id/consume — spend one use of an entitlement.
 * Idempotent: replaying the same Idempotency-Key never double-decrements.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await authenticateAgent(request);
    enforceRateLimit(agent.keyHash);
    const { id } = await params;

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new ApiError(
        "missing_idempotency_key",
        "The Idempotency-Key header is required for consume calls.",
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const ent = await tx.entitlement.findUnique({ where: { id } });
        if (!ent || ent.agentId !== agent.id) {
          throw new ApiError("not_found", `No entitlement "${id}" for this agent.`);
        }

        // Replay? Return current state unchanged.
        const prior = await tx.entitlementConsumption.findUnique({
          where: { agentId_idempotencyKey: { agentId: agent.id, idempotencyKey } },
        });
        if (prior) {
          return { replayed: true, ent };
        }

        if (ent.remainingUses < 1) {
          throw new ApiError(
            "invalid_request",
            "This entitlement has no remaining uses.",
          );
        }
        if (ent.expiresAt && ent.expiresAt < new Date()) {
          throw new ApiError("invalid_request", "This entitlement has expired.");
        }

        await tx.entitlementConsumption.create({
          data: { entitlementId: ent.id, agentId: agent.id, idempotencyKey },
        });

        const remaining = ent.remainingUses - 1;
        const updated = await tx.entitlement.update({
          where: { id: ent.id },
          data: {
            remainingUses: remaining,
            consumedAt: remaining === 0 ? new Date() : ent.consumedAt,
          },
        });

        await writeAuditLog(
          {
            organizationId: agent.organizationId,
            actorType: "agent",
            actorId: agent.id,
            action: "entitlement.consumed",
            metadata: {
              entitlement_id: ent.id,
              sku: ent.sku,
              remaining_uses: remaining,
              idempotency_key: idempotencyKey,
            },
          },
          tx,
        );

        return { replayed: false, ent: updated };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({
      ...entitlementJson(result.ent),
      replayed: result.replayed,
    });
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Concurrent replay raced us; the consumption was recorded exactly once.
      return errorResponse(
        new ApiError("duplicate_request_conflict", "Concurrent consume with this Idempotency-Key; retry to read the result."),
      );
    }
    return internalErrorResponse(e);
  }
}
