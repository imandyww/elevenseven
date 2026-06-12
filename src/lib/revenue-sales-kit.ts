import { formatCents } from "./money";
import { revenueOffers, type RevenueOffer } from "./revenue-offers";
import { absoluteUrl, type UrlOptions } from "./site";
import { prefilledStartUrl } from "./start-prefill";

const TARGET_DAILY_REVENUE_CENTS = 100000;

const targetSegments = [
  "Teams giving agents browser, tool, or payment permissions",
  "Agencies running outbound, support, or research agents for clients",
  "MCP builders who need security and checkout readiness before launch",
  "Operators who want one prepaid wallet and receipt trail for agent spend",
];

function mailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

function offerAngle(offer: RevenueOffer): string {
  if (offer.bundle.id === "thousand_day_wallet") {
    return "Close one production agent day without waiting on dashboard setup.";
  }
  if (offer.bundle.id === "fleet_week_wallet") {
    return "Fund launch, security, repair, and daily operations work from one wallet.";
  }
  return "Give an operator enough prepaid balance for sustained agent buying.";
}

function sampleWorkflow(offer: RevenueOffer): string {
  if (offer.bundle.id === "thousand_day_wallet") {
    return "Daily production workflow for revenue, research, or support agents with a measurable business target.";
  }
  if (offer.bundle.id === "fleet_week_wallet") {
    return "Launch-week agent fleet workflow with monitoring, security checks, and daily operations.";
  }
  return "Sustained agent fleet workflow with recurring operations, procurement, and repair budget.";
}

export function getRevenueSalesKit(options: UrlOptions = {}) {
  const offers = revenueOffers(options).map((offer) => {
    const subject = `${offer.bundle.name}: prepaid buying power for production agents`;
    const samplePrefill = {
      organizationName: "Buyer name",
      email: "buyer@example.com",
      agentName: "revenue-agent",
      workflow: sampleWorkflow(offer),
    };
    const prefilledOfferUrl = prefilledStartUrl(
      offer.url,
      samplePrefill,
      options,
    );
    const body = [
      "Hi,",
      "",
      `${offer.headline} ${offer.summary}`,
      "",
      `Offer: ${offer.bundle.name} (${formatCents(offer.bundle.priceCents)})`,
      `Direct start link: ${prefilledOfferUrl}`,
      "",
      "The flow creates the buyer wallet, first agent key, and Stripe checkout in one pass. Wallet credits post only after server-side Stripe reconciliation confirms payment, and agents spend inside policy limits with receipts.",
      "",
      "Worth doing when an agent is about to run production work, gain privileged tools, or needs a clean prepaid audit trail.",
    ].join("\n");

    return {
      bundle: offer.bundle.id,
      name: offer.bundle.name,
      price_cents: offer.bundle.priceCents,
      credits_cents: offer.bundle.creditsCents,
      offer_url: offer.url,
      prefilled_offer_url: prefilledOfferUrl,
      prefill_query_parameters: {
        organization: "Buyer name",
        email: "buyer@example.com",
        agent: "revenue-agent",
        workflow: sampleWorkflow(offer),
      },
      headline: offer.headline,
      angle: offerAngle(offer),
      target_daily_spend_cents: offer.targetDailySpendCents,
      target_segments: targetSegments,
      email: {
        subject,
        body,
        mailto_url: mailtoUrl("buyer@example.com", subject, body),
      },
      short_dm: `${offer.headline} ${formatCents(
        offer.bundle.priceCents,
      )} funds a prepaid agent wallet, first agent key, and recoverable Stripe checkout: ${prefilledOfferUrl}`,
      buyer_start_checkout_request: {
        method: "POST",
        path: "/api/buyer/start-checkout",
        body: {
          organization_name: "Buyer name",
          billing_email: "buyer@example.com",
          agent_name: "revenue-agent",
          target_daily_spend_cents: offer.targetDailySpendCents,
          initial_bundle: offer.bundle.id,
          workflow: sampleWorkflow(offer),
        },
      },
    };
  });

  return {
    generated_at: new Date().toISOString(),
    target_daily_revenue_cents: TARGET_DAILY_REVENUE_CENTS,
    close_plan_url: absoluteUrl("/api/revenue/close-plan", options),
    outreach_queue_url: absoluteUrl("/api/revenue/outreach", options),
    buyer_start_checkout_url: absoluteUrl(
      "/api/buyer/start-checkout",
      options,
    ),
    proof_points: [
      "Direct offer URLs create buyer workspace, wallet, agent key, and checkout.",
      "Server-side Stripe reconciliation is the only path that credits wallets.",
      "Offer URLs accept organization, email, website, agent, and workflow query parameters for prefilled buyer forms.",
      "Agent purchases spend prepaid credits inside policy limits.",
      "Receipts and entitlement manifests make purchases auditable.",
    ],
    target_segments: targetSegments,
    offers,
  };
}
