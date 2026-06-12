import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, errorResponse, internalErrorResponse } from "@/lib/api-errors";
import { authenticateAgent } from "@/lib/agent-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createFundingRequest,
  fundingRequestSchema,
} from "@/lib/funding-requests";

/**
 * POST /v1/funding-requests — convert agent purchase intent into a
 * human-fundable wallet request page.
 */
export async function POST(request: Request) {
  try {
    const agent = await authenticateAgent(request);
    await enforceRateLimit(agent.keyHash);

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new ApiError(
        "missing_idempotency_key",
        "The Idempotency-Key header is required so retries never create duplicate funding requests.",
      );
    }

    let body: z.infer<typeof fundingRequestSchema>;
    try {
      body = fundingRequestSchema.parse(await request.json());
    } catch (e) {
      const detail =
        e instanceof z.ZodError
          ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
          : "Body must be valid JSON.";
      throw new ApiError("invalid_request", `Invalid funding request — ${detail}`);
    }

    const result = await createFundingRequest(agent, idempotencyKey, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    return internalErrorResponse(e);
  }
}
