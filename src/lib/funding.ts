import { bundles, getBundle } from "./bundles";
import { absoluteUrl } from "./site";

export interface FundingHandoffInput {
  requiredCreditsCents: number;
  currentBalanceCents: number;
  sku?: string;
  quantity?: number;
  reason?: string;
  organizationId?: string;
  recommendedBundleId?: string;
  fundingRequestId?: string;
}

export function recommendBundle(requiredCreditsCents: number) {
  return (
    bundles.find((bundle) => bundle.creditsCents >= requiredCreditsCents) ??
    bundles[bundles.length - 1]
  );
}

export function fundingHandoff(input: FundingHandoffInput) {
  const shortfallCents = Math.max(
    0,
    input.requiredCreditsCents - input.currentBalanceCents,
  );
  const recommendedBundle =
    (input.recommendedBundleId && getBundle(input.recommendedBundleId)) ||
    recommendBundle(shortfallCents || input.requiredCreditsCents);
  const fundingRequestUrl = input.fundingRequestId
    ? absoluteUrl(`/funding-requests/${input.fundingRequestId}`)
    : null;

  return {
    human_action_required: true,
    reason: "wallet_funding_required",
    required_credits_cents: input.requiredCreditsCents,
    current_balance_cents: input.currentBalanceCents,
    shortfall_cents: shortfallCents,
    attempted_purchase: {
      sku: input.sku ?? null,
      quantity: input.quantity ?? null,
    },
    recommended_bundle: {
      id: recommendedBundle.id,
      name: recommendedBundle.name,
      price_cents: recommendedBundle.priceCents,
      credits_cents: recommendedBundle.creditsCents,
    },
    human_routes: {
      self_serve_start: absoluteUrl("/start"),
      paid_pilot: absoluteUrl("/pilot"),
      billing_dashboard: absoluteUrl("/dashboard/billing"),
      funding_request: fundingRequestUrl,
    },
    funding_request_endpoint: {
      method: "POST",
      path: "/v1/funding-requests",
      headers: {
        Authorization: "Bearer ag_live_...",
        "Idempotency-Key": "client-generated-key",
      },
      body: {
        sku: input.sku ?? "landing-page-copy-fixer",
        quantity: input.quantity ?? 1,
        max_total_cents: input.requiredCreditsCents,
        reason:
          input.reason ??
          "Create a human-fundable wallet request for this agent purchase.",
      },
    },
    checkout_session_request: {
      method: "POST",
      path: "/api/billing/create-checkout-session",
      body: {
        bundle: recommendedBundle.id,
        organization_id: input.organizationId ?? "org_demo",
        return_path: input.fundingRequestId ? "/funding-request" : "/pilot",
        ...(input.fundingRequestId
          ? { funding_request_id: input.fundingRequestId }
          : {}),
      },
    },
    message:
      "Create or share the funding request, ask a human operator to fund the organization wallet, then retry the purchase after Stripe credits post.",
  };
}
