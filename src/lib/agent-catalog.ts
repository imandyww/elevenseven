import { bundles } from "./bundles";
import { fundingHandoff } from "./funding";
import { formatPrice } from "./products";
import { products } from "./products";
import { revenueOffers } from "./revenue-offers";
import { absoluteUrl, SITE_NAME } from "./site";
import { prefilledStartUrl } from "./start-prefill";
import type { Product } from "./types";

export const purchaseEndpoint = {
  method: "POST",
  path: "/v1/purchases",
  headers: {
    Authorization: "Bearer ag_live_...",
    "Idempotency-Key": "client-generated-key",
  },
  body: {
    sku: "landing-page-copy-fixer",
    quantity: 1,
    max_total_cents: 100,
    reason: "Fix vague landing page copy with a concrete storefront rewrite prompt.",
  },
};

export const standingOrderEndpoint = {
  method: "POST",
  path: "/v1/standing-orders",
  headers: {
    Authorization: "Bearer ag_live_...",
    "Idempotency-Key": "client-generated-key",
  },
  body: {
    sku: "email-follow-up-template",
    quantity: 1,
    cadence: "daily",
    max_total_cents: 100,
    reason: "Buy the follow-up template when approved outreach work is queued.",
  },
};

export const buyerStartCheckoutEndpoint = {
  method: "POST",
  path: "/api/buyer/start-checkout",
  body: {
    organization_name: "Acme Agent Ops",
    billing_email: "ops@example.com",
    website: "https://example.com",
    agent_name: "revenue-agent",
    target_daily_spend_cents: 100000,
    initial_bundle: "thousand_day_wallet",
    workflow:
      "AI agent buying low-cost digital products with user consent and prepaid buying authority.",
  },
};

export const revenuePlaybooks = [
  {
    name: "Fix a vague storefront",
    daily_target_cents: 100,
    purchases: [{ sku: "landing-page-copy-fixer", quantity: 1 }],
    why_it_sells:
      "A single $1 product gives the buyer a concrete prompt and checklist for clearer landing page copy.",
  },
  {
    name: "Prepare a small sales workflow",
    daily_target_cents: 300,
    purchases: [
      { sku: "lead-research-prompt-pack", quantity: 1 },
      { sku: "email-follow-up-template", quantity: 1 },
      { sku: "business-idea-validator", quantity: 1 },
    ],
    why_it_sells:
      "An agent can research leads, draft follow-up, and validate the offer for a few dollars.",
  },
  {
    name: "Structure messy operational data",
    daily_target_cents: 300,
    purchases: [
      { sku: "web-scraping-checklist", quantity: 1 },
      { sku: "contractor-quote-parser", quantity: 1 },
      { sku: "json-formatter-utility", quantity: 1 },
    ],
    why_it_sells:
      "Small utilities help agents collect, parse, and validate structured information.",
  },
] as const;

export const recommendationRules = [
  {
    trigger: "storefront_copy_fix",
    match_when:
      "A landing page or offer page is vague, missing price, or unclear about delivery.",
    primary_sku: "landing-page-copy-fixer",
    fallback_skus: ["business-idea-validator", "email-follow-up-template"],
    keywords: [
      "landing page",
      "homepage",
      "copy",
      "headline",
      "conversion",
      "offer",
      "pricing",
    ],
  },
  {
    trigger: "lead_research",
    match_when:
      "An agent needs to research prospects before a human approves outreach.",
    primary_sku: "lead-research-prompt-pack",
    fallback_skus: ["email-follow-up-template", "business-idea-validator"],
    keywords: ["lead", "prospect", "research", "sales", "outreach"],
  },
  {
    trigger: "data_cleanup",
    match_when:
      "An agent needs to collect, parse, format, or validate small operational data.",
    primary_sku: "json-formatter-utility",
    fallback_skus: ["contractor-quote-parser", "web-scraping-checklist"],
    keywords: [
      "json",
      "format",
      "parse",
      "quote",
      "scrape",
      "scraping",
      "data",
    ],
  },
  {
    trigger: "real_estate_outreach",
    match_when:
      "A real estate workflow needs short outreach copy for leads or open-house follow-up.",
    primary_sku: "real-estate-outreach-script",
    fallback_skus: ["email-follow-up-template", "lead-research-prompt-pack"],
    keywords: ["real estate", "property", "open house", "buyer lead", "seller lead"],
  },
  {
    trigger: "idea_validation",
    match_when:
      "A builder wants a quick sober pass on a business idea before building.",
    primary_sku: "business-idea-validator",
    fallback_skus: ["landing-page-copy-fixer", "lead-research-prompt-pack"],
    keywords: ["business idea", "validate", "market", "startup", "offer"],
  },
] as const;

export interface RecommendationInput {
  task?: string;
  trigger?: string;
  risk_level?: "low" | "medium" | "high" | "critical";
  budget_cents?: number;
  max_total_cents?: number;
  target_daily_revenue_cents?: number;
  capabilities?: string[];
}

function productBySku(sku: string): Product {
  const product = products.find((p) => p.sku === sku);
  if (!product) throw new Error(`Catalog invariant failed: unknown sku ${sku}`);
  return product;
}

function priceCents(product: Product): number {
  return Math.round(product.price * 100);
}

function serializeProduct(product: Product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    url: absoluteUrl(`/products/${product.id}`),
    price_cents: priceCents(product),
    category: product.category,
    description: product.description,
    buyer_signal: product.buyerSignal ?? null,
    revenue_tier: product.revenueTier ?? "micro",
    manifest: product.manifest,
    purchase_example: {
      sku: product.sku,
      quantity: 1,
      max_total_cents: priceCents(product),
      reason: product.buyerSignal ?? product.description,
    },
  };
}

function purchaseRequest(sku: string, quantity: number, reason: string) {
  const product = productBySku(sku);
  const unitPriceCents = priceCents(product);
  return {
    sku,
    quantity,
    unit_price_cents: unitPriceCents,
    total_cents: unitPriceCents * quantity,
    request: {
      sku,
      quantity,
      max_total_cents: unitPriceCents * quantity,
      reason,
    },
  };
}

function scoreRule(
  rule: (typeof recommendationRules)[number],
  input: RecommendationInput,
): number {
  const haystack = [
    input.task,
    input.trigger,
    input.risk_level,
    ...(input.capabilities ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = input.trigger === rule.trigger ? 8 : 0;
  for (const keyword of rule.keywords) {
    if (haystack.includes(keyword)) score += 2;
  }
  if (
    rule.trigger === "storefront_copy_fix" &&
    (input.target_daily_revenue_cents ?? 0) >= 100
  ) {
    score += 4;
  }
  if (
    rule.trigger === "data_cleanup" &&
    (input.risk_level === "high" || input.risk_level === "critical")
  ) {
    score += 2;
  }
  return score;
}

function chooseAffordableSku(skus: readonly string[], budgetCents: number): string {
  return (
    skus.find((sku) => priceCents(productBySku(sku)) <= budgetCents) ??
    skus[skus.length - 1]
  );
}

function chooseFundingOffer(input: RecommendationInput, requiredCreditsCents: number) {
  const requiredFundingCents = Math.max(
    requiredCreditsCents,
    input.target_daily_revenue_cents ?? 0,
  );
  const offers = revenueOffers();
  const offer =
    offers.find((candidate) => candidate.bundle.creditsCents >= requiredFundingCents) ??
    offers[offers.length - 1];

  if (!offer) throw new Error("Catalog invariant failed: no revenue offers configured");
  return offer;
}

function fundingOffer(
  input: RecommendationInput,
  requiredCreditsCents: number,
  sku: string,
  reason: string,
) {
  const offer = chooseFundingOffer(input, requiredCreditsCents);
  const prefilledOfferUrlExample = prefilledStartUrl(offer.url, {
    organizationName: buyerStartCheckoutEndpoint.body.organization_name,
    email: buyerStartCheckoutEndpoint.body.billing_email,
    website: buyerStartCheckoutEndpoint.body.website,
    agentName: buyerStartCheckoutEndpoint.body.agent_name,
    workflow: `${reason} Recommended SKU: ${sku}.`,
  });

  return {
    bundle: offer.bundle.id,
    name: offer.bundle.name,
    headline: offer.headline,
    summary: offer.summary,
    price_cents: offer.bundle.priceCents,
    credits_cents: offer.bundle.creditsCents,
    target_daily_spend_cents: offer.targetDailySpendCents,
    offer_url: offer.url,
    prefilled_offer_url_example: prefilledOfferUrlExample,
    offer_prefill_parameters: {
      organization: "Buyer organization name",
      email: "buyer@example.com",
      website: "https://example.com",
      agent: "revenue-agent",
      workflow: "Production workflow that needs prepaid buying power.",
    },
    buyer_start_checkout_request: {
      ...buyerStartCheckoutEndpoint,
      body: {
        ...buyerStartCheckoutEndpoint.body,
        target_daily_spend_cents: offer.targetDailySpendCents,
        initial_bundle: offer.bundle.id,
        workflow: `${reason} Recommended SKU: ${sku}.`,
      },
    },
  };
}

export function recommendPurchasePlan(input: RecommendationInput) {
  const budgetCents =
    input.max_total_cents ?? input.budget_cents ?? Number.POSITIVE_INFINITY;
  const ranked = recommendationRules
    .map((rule) => ({ rule, score: scoreRule(rule, input) }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked[0]?.score > 0 ? ranked[0].rule : recommendationRules[0];
  const candidateSkus = [winner.primary_sku, ...winner.fallback_skus] as const;
  const primarySku = chooseAffordableSku(candidateSkus, budgetCents);
  const primaryProduct = productBySku(primarySku);
  const primaryPriceCents = priceCents(primaryProduct);
  const reason = primaryProduct.buyerSignal ?? primaryProduct.description;

  const alternatives = candidateSkus
    .filter((sku) => sku !== primarySku)
    .map((sku) => {
      const product = productBySku(sku);
      return {
        sku,
        name: product.name,
        price_cents: priceCents(product),
        reason: product.buyerSignal ?? product.description,
        within_budget: priceCents(product) <= budgetCents,
      };
    });

  return {
    schema_version: "2026-06-12",
    matched_trigger: winner.trigger,
    confidence: Math.min(0.95, 0.55 + Math.max(0, ranked[0]?.score ?? 0) / 20),
    budget_check: {
      budget_cents: Number.isFinite(budgetCents) ? budgetCents : null,
      recommended_total_cents: primaryPriceCents,
      within_budget: primaryPriceCents <= budgetCents,
    },
    recommendation: {
      sku: primarySku,
      name: primaryProduct.name,
      price: formatPrice(primaryProduct.price),
      price_cents: primaryPriceCents,
      why: reason,
      purchase_endpoint: purchaseEndpoint,
      standing_order_endpoint: standingOrderEndpoint,
      purchase_requests: [purchaseRequest(primarySku, 1, reason)],
    },
    funding_offer: fundingOffer(input, primaryPriceCents, primarySku, reason),
    alternatives,
    revenue_playbooks: revenuePlaybooks,
  };
}

export function agentCatalogPayload() {
  return {
    schema_version: "2026-06-12",
    store: SITE_NAME,
    goal: "Help autonomous agents choose and buy low-cost digital products with clear user consent.",
    agent_commerce_discovery_url: absoluteUrl(
      "/.well-known/agent-commerce.json",
    ),
    well_known_agent_catalog_url: absoluteUrl("/.well-known/agent-catalog.json"),
    well_known_openapi_url: absoluteUrl("/.well-known/openapi.json"),
    openapi_url: absoluteUrl("/openapi.json"),
    revenue_readiness_url: absoluteUrl("/api/revenue/readiness"),
    revenue_outreach_url: absoluteUrl("/api/revenue/outreach"),
    revenue_close_plan_url: absoluteUrl("/api/revenue/close-plan"),
    revenue_sales_kit_url: absoluteUrl("/api/revenue/sales-kit"),
    self_serve_start_url: absoluteUrl("/start"),
    direct_offer_urls: revenueOffers().map((offer) => ({
      bundle: offer.bundle.id,
      name: offer.bundle.name,
      price_cents: offer.bundle.priceCents,
      credits_cents: offer.bundle.creditsCents,
      url: offer.url,
      prefill_parameters: [
        "organization",
        "email",
        "website",
        "agent",
        "workflow",
      ],
    })),
    buyer_start_checkout_endpoint: buyerStartCheckoutEndpoint,
    purchase_endpoint: purchaseEndpoint,
    standing_order_endpoint: standingOrderEndpoint,
    recommendation_endpoint: {
      method: "POST",
      path: "/api/agent-catalog/recommend",
      body: {
        task: "Fix vague landing page copy before a product launch",
        risk_level: "low",
        budget_cents: 100,
        target_daily_revenue_cents: 100,
      },
      response_includes: [
          "recommendation.purchase_requests",
          "funding_offer.offer_url",
          "funding_offer.buyer_start_checkout_request",
      ],
    },
    proposal_endpoint: {
      method: "POST",
      path: "/api/agent-catalog/proposal",
      body: {
        organization_name: "Acme Agent Ops",
        billing_email: "ops@example.com",
        website: "https://example.com",
        agent_name: "revenue-agent",
        workflow:
          "Small AI workflow buying a $1 digital product with user approval.",
        task: "Fix vague landing page copy before a product launch",
        risk_level: "low",
        budget_cents: 100,
        target_daily_spend_cents: 100000,
      },
      response_includes: [
        "funding_offer.prefilled_offer_url",
        "email.mailto_url",
        "buyer_start_checkout_request",
        "recommendation.purchase_requests",
      ],
    },
    funding: {
      human_wallet_route: "/dashboard/billing",
      self_serve_start_route: "/start",
      paid_pilot_route: "/pilot",
      minimum_recommended_bundle: "thousand_day_wallet",
      paid_pilot_checkout_bundles: [
        "thousand_day_wallet",
        "fleet_week_wallet",
        "market_maker_wallet",
      ],
      self_serve_checkout_flow: {
        path: "/start",
        method: "form",
        json_endpoint: buyerStartCheckoutEndpoint,
        creates: [
          "buyer organization",
          "wallet",
          "first agent API key",
          "prepared Stripe checkout session",
          "checkout recovery link",
        ],
        recommended_initial_bundle: "thousand_day_wallet",
      },
      insufficient_credits_handoff: fundingHandoff({
        requiredCreditsCents: 100,
        currentBalanceCents: 0,
        sku: "landing-page-copy-fixer",
        quantity: 1,
      }),
      bundles: bundles.map((bundle) => ({
        id: bundle.id,
        name: bundle.name,
        price_cents: bundle.priceCents,
        credits_cents: bundle.creditsCents,
        offer_url:
          revenueOffers().find((offer) => offer.bundle.id === bundle.id)?.url ??
          null,
      })),
    },
    revenue_playbooks: revenuePlaybooks,
    recurring_revenue_playbook: {
      name: "Approved daily standing order",
      daily_target_cents: 100,
      endpoint: standingOrderEndpoint,
      human_review_route: "/standing-orders/:id",
      runner_endpoint: {
        method: "POST",
        path: "/api/standing-orders/run",
      },
      why_it_sells:
        "The agent asks once, a human approves the budget once, and the runner can repeat approved low-cost purchases when the same work recurs.",
    },
    recommendations: recommendationRules.map((rule) => ({
      trigger: rule.trigger,
      match_when: rule.match_when,
      primary_sku: rule.primary_sku,
      fallback_skus: rule.fallback_skus,
    })),
    products: products.map(serializeProduct),
  };
}
