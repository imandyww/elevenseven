import { NextResponse } from "next/server";
import { ApiError, errorResponse, internalErrorResponse } from "@/lib/api-errors";
import { authenticateAgent } from "@/lib/agent-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

/** GET /v1/receipts/:id — an agent can only read its own receipts. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await authenticateAgent(request);
    enforceRateLimit(agent.keyHash);
    const { id } = await params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        order: { include: { items: true, entitlements: true } },
      },
    });

    // 404 (not 403) for foreign receipts: don't confirm they exist.
    if (!receipt || receipt.agentId !== agent.id) {
      throw new ApiError("not_found", `No receipt "${id}" for this agent.`);
    }

    return NextResponse.json({
      receipt_id: receipt.id,
      order_id: receipt.orderId,
      agent_id: receipt.agentId,
      created_at: receipt.createdAt.toISOString(),
      receipt: JSON.parse(receipt.receiptJson),
      items: receipt.order.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
      })),
      entitlements: receipt.order.entitlements.map((ent) => ({
        entitlement_id: ent.id,
        sku: ent.sku,
        manifest: JSON.parse(ent.manifestJson),
        allowed_uses: ent.allowedUses,
        remaining_uses: ent.remainingUses,
        consumed_at: ent.consumedAt?.toISOString() ?? null,
      })),
    });
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    return internalErrorResponse(e);
  }
}
