import {
  buyerStartCheckoutEndpoint,
  recommendPurchasePlan,
  type RecommendationInput,
} from "./agent-catalog";
import { formatCents } from "./money";
import { prefilledStartUrl } from "./start-prefill";

export interface AgentProposalInput extends RecommendationInput {
  organization_name: string;
  billing_email: string;
  website?: string;
  agent_name?: string;
  workflow: string;
  target_daily_spend_cents?: number;
}

function mailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function createAgentBuyerProposal(input: AgentProposalInput) {
  const targetDailySpendCents =
    input.target_daily_spend_cents ??
    input.target_daily_revenue_cents ??
    100000;
  const plan = recommendPurchasePlan({
    task: input.task ?? input.workflow,
    trigger: input.trigger,
    risk_level: input.risk_level,
    budget_cents: input.budget_cents,
    max_total_cents: input.max_total_cents,
    target_daily_revenue_cents: targetDailySpendCents,
    capabilities: input.capabilities,
  });
  const offer = plan.funding_offer;
  const agentName = input.agent_name ?? "revenue-agent";
  const workflow = `${input.workflow} Recommended product: ${plan.recommendation.sku}.`;
  const prefilledOfferUrl = prefilledStartUrl(offer.offer_url, {
    organizationName: input.organization_name,
    email: input.billing_email,
    website: input.website,
    agentName,
    workflow,
  });
  const subject = `${offer.name}: fund ${input.organization_name}'s agent wallet`;
  const body = [
    `Hi ${input.organization_name},`,
    "",
    `I prepared a checkout-ready ${offer.name} proposal for ${formatCents(
      offer.price_cents,
    )}:`,
    prefilledOfferUrl,
    "",
    `Recommended first purchase after funding: ${plan.recommendation.name} (${formatCents(
      plan.recommendation.price_cents,
    )}).`,
    `Why now: ${plan.recommendation.why}`,
    "",
    "One submit creates the buyer wallet, first agent key, and Stripe checkout. Wallet credits post only after server-side Stripe reconciliation confirms payment.",
  ].join("\n");

  return {
    schema_version: "2026-06-12",
    status: "proposal_ready",
    generated_at: new Date().toISOString(),
    expected_cash_revenue_cents: offer.price_cents,
    buyer: {
      organization_name: input.organization_name,
      billing_email: input.billing_email,
      website: input.website ?? null,
    },
    recommendation: {
      matched_trigger: plan.matched_trigger,
      confidence: plan.confidence,
      sku: plan.recommendation.sku,
      name: plan.recommendation.name,
      price_cents: plan.recommendation.price_cents,
      why: plan.recommendation.why,
      purchase_requests: plan.recommendation.purchase_requests,
      alternatives: plan.alternatives,
    },
    funding_offer: {
      bundle: offer.bundle,
      name: offer.name,
      price_cents: offer.price_cents,
      credits_cents: offer.credits_cents,
      target_daily_spend_cents: offer.target_daily_spend_cents,
      offer_url: offer.offer_url,
      prefilled_offer_url: prefilledOfferUrl,
    },
    buyer_start_checkout_request: {
      method: buyerStartCheckoutEndpoint.method,
      path: buyerStartCheckoutEndpoint.path,
      body: {
        organization_name: input.organization_name,
        billing_email: input.billing_email,
        website: input.website,
        agent_name: agentName,
        target_daily_spend_cents: offer.target_daily_spend_cents,
        initial_bundle: offer.bundle,
        workflow,
      },
    },
    email: {
      subject,
      body,
      mailto_url: mailtoUrl(input.billing_email, subject, body),
    },
    next_actions: [
      "Send funding_offer.prefilled_offer_url to the buyer.",
      "Or POST buyer_start_checkout_request.body to create the wallet, first agent key, and Stripe checkout immediately.",
      "After server-side Stripe reconciliation confirms payment, use recommendation.purchase_requests with the new agent key.",
    ],
  };
}
