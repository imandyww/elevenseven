import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, errorResponse, internalErrorResponse } from "@/lib/api-errors";
import { authenticateAgent } from "@/lib/agent-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createStandingOrder,
  standingOrderRequestSchema,
} from "@/lib/standing-orders";

/**
 * POST /v1/standing-orders - ask a human to approve a recurring agent purchase.
 */
export async function POST(request: Request) {
  try {
    const agent = await authenticateAgent(request);
    await enforceRateLimit(agent.keyHash);

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new ApiError(
        "missing_idempotency_key",
        "The Idempotency-Key header is required so retries never create duplicate standing orders.",
      );
    }

    let body: z.infer<typeof standingOrderRequestSchema>;
    try {
      body = standingOrderRequestSchema.parse(await request.json());
    } catch (e) {
      const detail =
        e instanceof z.ZodError
          ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
          : "Body must be valid JSON.";
      throw new ApiError("invalid_request", `Invalid standing order - ${detail}`);
    }

    const result = await createStandingOrder(agent, idempotencyKey, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    return internalErrorResponse(e);
  }
}
