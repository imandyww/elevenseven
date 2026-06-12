import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, errorResponse } from "@/lib/api-errors";
import {
  clientIpFromHeaders,
  enforceCreationRateLimit,
} from "@/lib/rate-limit";
import {
  createSelfServeStart,
  selfServeStartSchema,
} from "@/lib/self-serve-start";
import { originFromRequest } from "@/lib/site";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  organization_name: z.string().trim().min(2).max(120),
  billing_email: z.string().trim().email().max(200),
  website: z.string().trim().max(200).optional(),
  agent_name: z.string().trim().min(2).max(80).default("revenue-agent"),
  target_daily_spend_cents: z.coerce.number().int().min(100000).max(500000),
  initial_bundle: z
    .enum(["thousand_day_wallet", "fleet_week_wallet", "market_maker_wallet"])
    .default("thousand_day_wallet"),
  workflow: z.string().trim().min(20).max(1200),
});

export async function POST(request: Request) {
  try {
    await enforceCreationRateLimit(clientIpFromHeaders(request.headers));
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    throw e;
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message:
            "Expected organization_name, billing_email, workflow, target_daily_spend_cents, and optional initial_bundle.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = selfServeStartSchema.parse({
    organizationName: body.organization_name,
    email: body.billing_email,
    website: body.website,
    agentName: body.agent_name,
    targetDailySpendCents: body.target_daily_spend_cents,
    initialBundle: body.initial_bundle,
    workflow: body.workflow,
  });

  const started = await createSelfServeStart(parsed, {
    origin: originFromRequest(request),
  });

  return NextResponse.json(
    {
      schema_version: "2026-06-12",
      status: "created",
      organization: {
        id: started.organizationId,
        name: started.organizationName,
        billing_email: started.billingEmail,
      },
      agent: {
        id: started.agentId,
        name: started.agentName,
        key_prefix: started.keyPrefix,
        api_key_once: started.rawKey,
      },
      wallet: {
        currency: "usd",
        target_daily_spend_cents: started.targetDailySpendCents,
      },
      checkout: {
        status: started.checkoutUrl ? "ready" : "error",
        bundle: started.checkoutBundleId,
        amount_cents: started.checkoutAmountCents ?? null,
        credits_cents: started.checkoutCreditsCents ?? null,
        url: started.checkoutUrl ?? null,
        recovery_url: started.checkoutRecoveryUrl ?? null,
        checkout_intent_id: started.checkoutIntentId ?? null,
        error: started.checkoutError ?? null,
      },
      next_actions: started.checkoutUrl
        ? [
            "Send the checkout.url to the buyer.",
            "Store agent.api_key_once immediately; it will not be shown again.",
            "After server-side Stripe reconciliation, use /v1/purchases with the agent key.",
          ]
        : [
            "Store agent.api_key_once immediately; it will not be shown again.",
            "Configure STRIPE_SECRET_KEY, then create a checkout session for this organization.",
          ],
    },
    { status: 201 },
  );
}
