import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, errorResponse } from "@/lib/api-errors";
import {
  CheckoutSessionError,
  createWalletCheckoutSession,
} from "@/lib/checkout-sessions";
import {
  clientIpFromHeaders,
  enforceCreationRateLimit,
} from "@/lib/rate-limit";
import { originFromRequest } from "@/lib/site";

const bodySchema = z.object({
  bundle: z.enum([
    "starter_wallet",
    "debug_pack",
    "workflow_bundle",
    "operator_wallet",
    "scale_wallet",
    "thousand_day_wallet",
    "fleet_week_wallet",
    "market_maker_wallet",
  ]),
  organization_id: z.string().min(1),
  return_path: z
    .enum([
      "/dashboard/billing",
      "/pilot",
      "/funding-request",
      "/standing-order",
      "/start",
    ])
    .default("/dashboard/billing"),
  funding_request_id: z.string().min(1).optional(),
  standing_order_id: z.string().min(1).optional(),
});

/**
 * Creates a Stripe Checkout Session for a credit bundle, server-side only.
 * The wallet is credited only after server-side Stripe verification in the
 * webhook or Revenue dashboard sync — never here and never from the browser's
 * success redirect.
 */
export async function POST(request: Request) {
  try {
    await enforceCreationRateLimit(clientIpFromHeaders(request.headers));
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    throw e;
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message:
            "Expected { bundle, organization_id, return_path?, funding_request_id?, standing_order_id? }.",
        },
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await createWalletCheckoutSession({
      bundleId: parsed.bundle,
      organizationId: parsed.organization_id,
      returnPath: parsed.return_path,
      fundingRequestId: parsed.funding_request_id,
      standingOrderId: parsed.standing_order_id,
      origin: originFromRequest(request),
    }));
  } catch (e) {
    if (e instanceof CheckoutSessionError) {
      return NextResponse.json({
        error: {
          code: e.code,
          message: e.message,
        },
      }, { status: e.status });
    }

    console.error("[billing] checkout session failed:", e);
    return NextResponse.json({
      error: {
        code: "internal_error",
        message: "Could not start checkout. Is STRIPE_SECRET_KEY configured?",
      },
    }, { status: 500 });
  }
}
