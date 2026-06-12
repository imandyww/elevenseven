import { formatPrice, products } from "@/lib/products";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt (https://llmstxt.org) — a curated, plain-markdown map of the site
 * for LLMs and autonomous agents. Generated from the catalog so it never
 * drifts from what the store actually sells.
 */
export function GET() {
  const catalog = products
    .map(
      (p) =>
        `- [${p.name}](${absoluteUrl(`/products/${p.id}`)}): ${formatPrice(p.price)} · ${p.category} · sku \`${p.sku}\` — ${p.description}`,
    )
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Humans get a storefront; agents get a JSON API and a prepaid-credits payment
system. AI agents never hold cards: a human funds an organization wallet with
Agent Credits (via Stripe), each agent gets an API key plus a spending policy,
and agents spend credits within those limits. Every purchase returns a receipt
and a machine-readable entitlement manifest.

Ready buyers can create their own organization wallet, first agent key, and
prepared Stripe wallet checkout at ${absoluteUrl("/start")}; this funds the
buyer's wallet, not the demo org.

## Catalog

All ${products.length} products. Prices are in USD; every product has a stable sku usable with the APIs below.

${catalog}

## Public API (no auth)

- [GET /.well-known/agent-commerce.json](${absoluteUrl("/.well-known/agent-commerce.json")}): lightweight autonomous-buyer discovery manifest with catalog, OpenAPI, recommendation, direct wallet offer, and buyer-start links
- [GET /.well-known/agent-catalog.json](${absoluteUrl("/.well-known/agent-catalog.json")}): well-known alias for the full agent-optimized catalog
- [GET /.well-known/openapi.json](${absoluteUrl("/.well-known/openapi.json")}): well-known alias for the OpenAPI 3.1 contract
- [GET /api/agent-catalog](${absoluteUrl("/api/agent-catalog")}): agent-optimized catalog with buying playbooks, funding bundles, recommendations, and purchase examples
- POST /api/agent-catalog/recommend: recommend a purchase plan plus \`funding_offer.offer_url\` and \`funding_offer.buyer_start_checkout_request\` — body \`{"task":"Daily production workflow for outbound sales agents","risk_level":"high","budget_cents":100000,"target_daily_revenue_cents":100000}\`
- POST /api/agent-catalog/proposal: create a buyer-specific wallet proposal with \`funding_offer.prefilled_offer_url\`, \`email.mailto_url\`, \`buyer_start_checkout_request\`, and post-funding purchase requests — body \`{"organization_name":"Acme Agent Ops","billing_email":"ops@example.com","workflow":"Daily outbound sales workflow with prepaid buying authority and a measurable revenue target.","task":"Daily production workflow for outbound sales agents","risk_level":"high","budget_cents":100000,"target_daily_spend_cents":100000}\`
- [GET /openapi.json](${absoluteUrl("/openapi.json")}): OpenAPI 3.1 contract for catalog discovery, wallet funding, purchases, receipts, and entitlement consumption
- [GET /api/products](${absoluteUrl("/api/products")}): full catalog as JSON — id, sku, price, category, descriptions, manifest
- [GET /api/products/:id](${absoluteUrl("/api/products/thousand-dollar-day-pack")}): one product by id or sku
- POST /api/cart: price a cart before committing and get \`wallet_funding.offer_url\`, \`wallet_funding.buyer_start_checkout_request\`, and post-funding purchase requests — body \`{"items":[{"sku":"...","quantity":1}]}\`
- POST /api/buyer/start-checkout: create a buyer organization, wallet, one-time agent key, pilot lead, and prepared Stripe wallet checkout — body \`{"organization_name":"Acme Agent Ops","billing_email":"ops@example.com","agent_name":"revenue-agent","target_daily_spend_cents":100000,"initial_bundle":"thousand_day_wallet","workflow":"Production agent workflow with prepaid buying authority."}\`
- POST /api/billing/create-checkout-session: create a Stripe wallet-funding checkout; returns \`url\`, \`checkout_intent_id\`, \`stripe_session_id\`, and \`recovery_url\`; recovery pages resume active Stripe sessions or create fresh checkouts for the same buyer wallet and bundle after expiration
- [GET /api/revenue/readiness](${absoluteUrl("/api/revenue/readiness")}): non-secret go-live checks for Stripe config, webhook reconciliation, checkout recovery, and repeat-purchase readiness
- [GET /api/revenue/outreach](${absoluteUrl("/api/revenue/outreach")}): prioritized operator follow-up queue for live and refreshable checkouts, paid-pilot leads, funding requests, and requested standing orders; checkout items include \`checkout_state\`; pilot leads use prefilled direct wallet offer URLs
- [GET /api/revenue/close-plan](${absoluteUrl("/api/revenue/close-plan")}): today's verified Stripe revenue gap, \`buyer_link_readiness\`, live and refreshable checkout coverage, \`parallel_close_actions\` to send now, and new-pipeline request body
- [GET /api/revenue/sales-kit](${absoluteUrl("/api/revenue/sales-kit")}): target segments, direct wallet offer URLs, prefilled offer URL examples, email/DM copy, and buyer-start request bodies for $1k, $2.5k, and $5k wallet offers
- POST /api/checkout: legacy simulated human checkout; no real payment, \`revenue_booked_cents\` is 0, and the response points serious buyers to \`wallet_funding.offer_url\`

## Agent API (Bearer auth, credits)

All /v1 endpoints require \`Authorization: Bearer ag_live_...\`; writes also
require an \`Idempotency-Key\` header. Errors are always
\`{"error":{"code":"...","message":"..."}}\`. Rate limit: 60 req/min per key.

- POST /v1/purchases: buy a product — body \`{"sku":"thousand-dollar-day-pack","quantity":1,"max_total_cents":100000,"reason":"Daily operating pack for an agent fleet with a measurable target."}\`; returns 201 with order, receipt, and entitlement manifest; idempotent per key
- POST /v1/funding-requests: create a human-fundable wallet request — body \`{"sku":"thousand-dollar-day-pack","quantity":1,"max_total_cents":100000,"reason":"Wallet needs funding before the agent can buy the daily operating pack."}\`; returns a shareable \`human_url\` like /funding-requests/:id
- POST /v1/standing-orders: request a human-approved recurring purchase — body \`{"sku":"thousand-dollar-day-pack","quantity":1,"cadence":"daily","max_total_cents":100000,"reason":"Buy the daily operating pack whenever production revenue work is queued."}\`; returns a shareable \`human_url\` like /standing-orders/:id
- GET /v1/balance: wallet balance and spending limits
- GET /v1/receipts/:id: fetch one of your receipts
- POST /v1/entitlements/:id/consume: consume one use of an entitlement (idempotent)

If POST /v1/purchases returns \`insufficient_credits\`, the error includes
\`error.details.funding\` with the recommended wallet bundle, /start, /pilot
and /dashboard/billing human routes, the /v1/funding-requests request body,
and the checkout-session request body.

For repeat work, use /v1/standing-orders. A human activates the standing order
once, then POST /api/standing-orders/run executes active daily orders once per
UTC day and creates funding requests automatically when credits are short.

## Pages

- [Home](${absoluteUrl("/")}): what the store is and featured upgrades
- [Start](${absoluteUrl("/start")}): self-serve buyer workspace, wallet, first agent key, prepared Stripe checkout, and direct wallet funding
- [Buy $1k/day Wallet](${absoluteUrl("/buy/thousand_day_wallet")}): direct shareable offer page for one daily target wallet checkout
- [Buy Fleet Week Wallet](${absoluteUrl("/buy/fleet_week_wallet")}): direct shareable offer page for $2,500 wallet funding
- [Buy Market Maker Wallet](${absoluteUrl("/buy/market_maker_wallet")}): direct shareable offer page for $5,000 wallet funding
- /checkout/:token: private recovery page that resumes an active wallet checkout, refreshes an expired checkout for the same buyer wallet and bundle, or shows completed funding status
- [Paid Pilot](${absoluteUrl("/pilot")}): high-intent human intake plus direct Stripe wallet checkout for $1k/day agent fleet pilots
- [Shop](${absoluteUrl("/shop")}): browse the full catalog by category
- [Agent API docs](${absoluteUrl("/docs")}): human-readable API reference with examples
- [About](${absoluteUrl("/about")}): why a convenience store for AI agents exists
- [Terms of Service](${absoluteUrl("/terms")}): prepaid credit terms, refunds, acceptable use
- [Privacy Policy](${absoluteUrl("/privacy")}): what data the store holds and why

## Optional

- [Sitemap](${absoluteUrl("/sitemap.xml")}): all indexable URLs
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
