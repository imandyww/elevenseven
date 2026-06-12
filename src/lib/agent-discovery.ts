import {
  buyerStartCheckoutEndpoint,
  purchaseEndpoint,
  revenuePlaybooks,
  standingOrderEndpoint,
} from "./agent-catalog";
import { products } from "./products";
import { revenueOffers } from "./revenue-offers";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";

const featuredSkus = [
  "thousand-dollar-day-pack",
  "mcp-security-red-team",
  "agent-fleet-launch-pack",
  "procurement-autopilot",
  "agentic-checkout-hardening",
  "compliance-brief",
] as const;

function priceCents(price: number) {
  return Math.round(price * 100);
}

export function agentCommerceDiscoveryPayload() {
  const featuredProducts = featuredSkus
    .map((sku) => products.find((product) => product.sku === sku))
    .filter((product): product is (typeof products)[number] => Boolean(product))
    .map((product) => ({
      sku: product.sku,
      name: product.name,
      price_cents: priceCents(product.price),
      category: product.category,
      url: absoluteUrl(`/products/${product.id}`),
      buyer_signal: product.buyerSignal ?? product.description,
    }));

  return {
    schema_version: "2026-06-12",
    manifest_type: "agent-commerce-discovery",
    store: SITE_NAME,
    description: SITE_DESCRIPTION,
    buying_model: {
      currency: "usd",
      payment: "Human funds an organization wallet with Stripe Checkout.",
      agent_spend:
        "Agents buy catalog items with prepaid Agent Credits and never receive card credentials.",
      wallet_crediting:
        "Wallet credits post only after server-side Stripe reconciliation confirms payment.",
    },
    discovery: {
      llms_txt: absoluteUrl("/llms.txt"),
      openapi: absoluteUrl("/openapi.json"),
      well_known_openapi: absoluteUrl("/.well-known/openapi.json"),
      agent_catalog: absoluteUrl("/api/agent-catalog"),
      well_known_agent_catalog: absoluteUrl("/.well-known/agent-catalog.json"),
      recommendation: absoluteUrl("/api/agent-catalog/recommend"),
      proposal: absoluteUrl("/api/agent-catalog/proposal"),
      revenue_close_plan: absoluteUrl("/api/revenue/close-plan"),
      revenue_sales_kit: absoluteUrl("/api/revenue/sales-kit"),
    },
    primary_action: {
      label: "Create buyer wallet, first agent key, and Stripe checkout.",
      method: buyerStartCheckoutEndpoint.method,
      path: buyerStartCheckoutEndpoint.path,
      body: buyerStartCheckoutEndpoint.body,
    },
    direct_wallet_offers: revenueOffers().map((offer) => ({
      bundle: offer.bundle.id,
      name: offer.bundle.name,
      price_cents: offer.bundle.priceCents,
      credits_cents: offer.bundle.creditsCents,
      target_daily_spend_cents: offer.targetDailySpendCents,
      url: offer.url,
      prefill_parameters: [
        "organization",
        "email",
        "website",
        "agent",
        "workflow",
      ],
    })),
    recommended_first_call: {
      method: "POST",
      path: "/api/agent-catalog/proposal",
      body: {
        organization_name: "Acme Agent Ops",
        billing_email: "ops@example.com",
        agent_name: "revenue-agent",
        workflow:
          "Daily production workflow for a revenue-generating agent fleet.",
        task: "Daily production workflow for a revenue-generating agent fleet",
        risk_level: "high",
        budget_cents: 100000,
        target_daily_spend_cents: 100000,
      },
      response_includes: [
        "funding_offer.prefilled_offer_url",
        "email.mailto_url",
        "buyer_start_checkout_request",
        "recommendation.purchase_requests",
      ],
    },
    purchase_after_funding: purchaseEndpoint,
    standing_order_after_funding: standingOrderEndpoint,
    featured_products: featuredProducts,
    revenue_playbooks: revenuePlaybooks,
    operator_instruction:
      "If cash revenue is below $1,000 today, open the close plan and send the top recovery or direct wallet offer link.",
  };
}
