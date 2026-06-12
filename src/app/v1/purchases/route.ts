import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, errorResponse, internalErrorResponse } from "@/lib/api-errors";
import { authenticateAgent } from "@/lib/agent-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { processPurchase, purchaseRequestSchema } from "@/lib/purchases";

/**
 * POST /v1/purchases — buy a product with prepaid Agent Credits.
 *
 * Headers:
 *   Authorization: Bearer ag_live_...
 *   Idempotency-Key: <client-chosen key, required>
 *
 * Body: { sku, quantity?, max_total_cents?, reason }
 */
export async function POST(request: Request) {
  try {
    const agent = await authenticateAgent(request);
    await enforceRateLimit(agent.keyHash);

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new ApiError(
        "missing_idempotency_key",
        "The Idempotency-Key header is required so retries never double-charge.",
      );
    }

    let body: z.infer<typeof purchaseRequestSchema>;
    try {
      body = purchaseRequestSchema.parse(await request.json());
    } catch (e) {
      const detail =
        e instanceof z.ZodError
          ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
          : "Body must be valid JSON.";
      throw new ApiError("invalid_request", `Invalid purchase request — ${detail}`);
    }

    const result = await processPurchase(agent, idempotencyKey, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    return internalErrorResponse(e);
  }
}
