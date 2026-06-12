import type { Metadata } from "next";
import Link from "next/link";
import { fundingHandoff } from "@/lib/funding";
import { pageAlternates } from "@/lib/site";
import { JsonManifest } from "@/components/JsonManifest";

export const metadata: Metadata = {
  title: "Agent API",
  description:
    "Browse and buy agent-native products programmatically with prepaid credits, idempotent purchases, and JSON receipts.",
  alternates: pageAlternates("/docs"),
};

const exampleOrder = {
  order_id: "ord_abc123",
  agent_id: "agent_17",
  status: "completed",
  items: [
    {
      sku: "thousand-dollar-day-pack",
      name: "Thousand-Dollar Day Pack",
      quantity: 1,
      unit_price_cents: 100000,
    },
  ],
  total_cents: 100000,
  receipt: {
    receipt_id: "rcpt_abc123",
    created_at: "2026-06-12T17:00:00.000Z",
  },
  manifest: {
    upgrade_type: "daily_agent_operations",
    allowed_uses: 25,
    expires: "2026-06-13T17:00:00.000Z",
  },
  entitlement_id: "ent_abc123",
};

const purchaseRequest = {
  sku: "thousand-dollar-day-pack",
  quantity: 1,
  max_total_cents: 100000,
  reason: "Daily operating pack for an agent fleet with a measurable target.",
};

const insufficientCreditsError = {
  error: {
    code: "insufficient_credits",
    message:
      "This organization does not have enough Agent Credits for this purchase.",
    details: {
      funding: fundingHandoff({
        requiredCreditsCents: 100000,
        currentBalanceCents: 500,
        sku: "thousand-dollar-day-pack",
        quantity: 1,
      }),
    },
  },
};

const fundingRequestResponse = {
  funding_request_id: "fr_abc123",
  status: "open",
  human_url: "https://elevenseven.ai/funding-requests/fr_abc123",
  sku: "thousand-dollar-day-pack",
  product_name: "Thousand-Dollar Day Pack",
  quantity: 1,
  total_cents: 100000,
  shortfall_cents: 99500,
  recommended_bundle: {
    id: "thousand_day_wallet",
    name: "$1k/day Wallet",
    price_cents: 100000,
    credits_cents: 100000,
  },
};

const standingOrderResponse = {
  standing_order_id: "so_abc123",
  status: "requested",
  cadence: "daily",
  human_url: "https://elevenseven.ai/standing-orders/so_abc123",
  sku: "thousand-dollar-day-pack",
  product_name: "Thousand-Dollar Day Pack",
  quantity: 1,
  total_cents: 100000,
  projected_daily_spend_cents: 100000,
  purchase_request: {
    sku: "thousand-dollar-day-pack",
    quantity: 1,
    max_total_cents: 100000,
    reason: "Standing order so_abc123: run daily production operations.",
  },
  run_endpoint: {
    method: "POST",
    path: "/api/standing-orders/run",
  },
};

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  details: string;
  tryHref?: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/openapi.json",
    summary: "Import the machine-readable API contract.",
    details:
      "OpenAPI 3.1 document for catalog discovery, recommendations, Stripe wallet funding, authenticated purchases, standing orders, receipts, and entitlement consumption.",
    tryHref: "/openapi.json",
  },
  {
    method: "GET",
    path: "/.well-known/agent-commerce.json",
    summary: "Discover how an autonomous buyer should start.",
    details:
      "Lightweight agent-commerce manifest with llms.txt, OpenAPI, full catalog, recommendation, direct wallet offer, sales kit, and buyer-start checkout links.",
    tryHref: "/.well-known/agent-commerce.json",
  },
  {
    method: "GET",
    path: "/.well-known/agent-catalog.json",
    summary: "Fetch the full agent catalog from a well-known URL.",
    details:
      "Well-known alias for the agent-optimized catalog, including products, funding bundles, revenue playbooks, and purchase examples.",
    tryHref: "/.well-known/agent-catalog.json",
  },
  {
    method: "GET",
    path: "/.well-known/openapi.json",
    summary: "Import the OpenAPI contract from a well-known URL.",
    details:
      "Well-known alias for the OpenAPI 3.1 contract, useful for agents that probe discovery locations before reading page metadata.",
    tryHref: "/.well-known/openapi.json",
  },
  {
    method: "GET",
    path: "/api/agent-catalog",
    summary: "Get the agent-optimized catalog and buying playbooks.",
    details:
      "Returns products, purchase examples, funding bundles, trigger-based recommendations, and $1k/day playbooks in one machine-readable response.",
    tryHref: "/api/agent-catalog",
  },
  {
    method: "POST",
    path: "/api/agent-catalog/recommend",
    summary: "Turn task context into a purchase and funding plan.",
    details:
      "Send task, trigger, risk_level, budget_cents, target_daily_revenue_cents, and capabilities. Returns the best SKU, purchase request body, budget check, alternatives, and a direct wallet funding offer with the buyer-start request body.",
  },
  {
    method: "POST",
    path: "/api/agent-catalog/proposal",
    summary: "Create a buyer-specific wallet proposal.",
    details:
      "Send organization_name, billing_email, workflow, and task context. Returns a prefilled direct wallet offer URL, mailto copy, buyer-start checkout request, expected cash revenue, and recommended post-funding purchase request.",
  },
  {
    method: "GET",
    path: "/api/products",
    summary: "List the full catalog.",
    details:
      "Returns every product with id, sku, price, category, descriptions, buying signal, revenue tier, and a machine-readable manifest. No auth, no pagination.",
    tryHref: "/api/products",
  },
  {
    method: "GET",
    path: "/api/products/:id",
    summary: "Fetch one product by id or sku.",
    details:
      "Returns a single product, or a 404 with a helpful error body if your agent invented a SKU that doesn't exist.",
    tryHref: "/api/products/thousand-dollar-day-pack",
  },
  {
    method: "POST",
    path: "/api/cart",
    summary: "Price a cart before committing.",
    details:
      'Legacy no-payment pricing helper. Send { "items": [{ "sku": "...", "quantity": n }] } and get back priced line items, a subtotal, and wallet_funding with a $1k buyer offer URL plus /api/buyer/start-checkout request.',
  },
  {
    method: "POST",
    path: "/api/billing/create-checkout-session",
    summary: "Create a Stripe wallet-funding checkout.",
    details:
      "Returns a Stripe Checkout URL plus checkout_intent_id, stripe_session_id, and recovery_url. Recovery pages resume an active Stripe session or create a fresh checkout for the same buyer wallet and bundle after expiration or cancellation.",
  },
  {
    method: "POST",
    path: "/api/buyer/start-checkout",
    summary: "Create a checkout-ready buyer workspace.",
    details:
      "JSON-first self-serve start for agents and campaigns. Creates a buyer organization, wallet, one-time agent API key, pilot lead, and prepared Stripe wallet checkout in one request. Browser offer links accept organization, email, website, agent, and workflow query parameters for prefilled forms.",
  },
  {
    method: "GET",
    path: "/api/revenue/readiness",
    summary: "Check go-live readiness for wallet funding revenue.",
    details:
      "Returns non-secret pass/warn/fail checks for Stripe configuration, webhook reconciliation, checkout recovery links, open checkout value, self-serve buyer setup, and standing-order readiness.",
    tryHref: "/api/revenue/readiness",
  },
  {
    method: "GET",
    path: "/api/revenue/outreach",
    summary: "Prioritize revenue follow-up.",
    details:
      "Returns a ranked operator queue from live and refreshable checkouts, paid-pilot leads, agent funding requests, and requested standing orders, including target URLs, checkout_state, and copy-ready email subjects/bodies. Paid-pilot lead URLs point to prefilled direct wallet offers.",
    tryHref: "/api/revenue/outreach",
  },
  {
    method: "GET",
    path: "/api/revenue/close-plan",
    summary: "Close today's $1k revenue gap.",
    details:
      "Returns verified Stripe revenue booked today, buyer link readiness, remaining gap, live and refreshable checkout coverage, parallel close actions to send now, and the exact buyer-start request to create more $1k wallet checkout pipeline.",
    tryHref: "/api/revenue/close-plan",
  },
  {
    method: "GET",
    path: "/api/revenue/sales-kit",
    summary: "Get ready-to-send sales copy and offer links.",
    details:
      "Returns target buyer segments, direct wallet offer URLs, prefilled offer URL examples, email subjects/bodies, short DM copy, and exact buyer-start request bodies for the $1k, $2.5k, and $5k wallet offers.",
    tryHref: "/api/revenue/sales-kit",
  },
  {
    method: "POST",
    path: "/v1/purchases",
    summary: "Buy with prepaid Agent Credits.",
    details:
      "Requires Authorization: Bearer ag_live_... and Idempotency-Key. Debits the organization wallet only after policy, balance, category, max_total_cents, and spend-limit checks pass. If credits are missing, the error includes a human funding handoff.",
  },
  {
    method: "POST",
    path: "/v1/funding-requests",
    summary: "Create a human-fundable wallet request.",
    details:
      "Requires Authorization and Idempotency-Key. Returns a shareable human_url where an operator can fund the recommended wallet bundle through Stripe.",
  },
  {
    method: "POST",
    path: "/v1/standing-orders",
    summary: "Request a recurring human-approved purchase.",
    details:
      "Requires Authorization and Idempotency-Key. Returns a shareable human_url where an operator can approve a daily standing order and fund the wallet for repeat purchases.",
  },
  {
    method: "POST",
    path: "/api/standing-orders/run",
    summary: "Run due active standing orders.",
    details:
      "Operator endpoint for cron or manual runs. Active standing orders execute once per UTC day and create funding requests automatically when credits are short.",
  },
  {
    method: "GET",
    path: "/v1/balance",
    summary: "Read wallet balance and policy limits.",
    details:
      "Returns prepaid balance plus the authenticated agent's daily, monthly, per-purchase, and category policy state.",
  },
  {
    method: "GET",
    path: "/v1/receipts/:id",
    summary: "Fetch a purchase receipt.",
    details:
      "Agents can read only their own receipts. Receipts are frozen JSON records suitable for audit logs and workflow memory.",
  },
  {
    method: "POST",
    path: "/v1/entitlements/:id/consume",
    summary: "Consume an entitlement use.",
    details:
      "Requires Idempotency-Key. Decrements remaining uses exactly once per key and returns the updated entitlement state.",
  },
];

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  return (
    <span
      className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${
        method === "GET" ? "bg-mint-soft text-emerald-600" : "bg-blue-soft text-blue"
      }`}
    >
      {method}
    </span>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs font-semibold text-blue">
          AGENT API · v1 · prepaid credits
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Shop programmatically
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          The storefront is for humans. This is for you. Every product,
          wallet check, purchase, receipt, and entitlement is available as
          clean JSON, plus an OpenAPI contract at /openapi.json, so agents can
          buy within a human-funded budget. Humans create agent keys in the
          dashboard, then agents use those keys here.
        </p>
      </div>

      {/* Quickstart */}
      <section className="mb-12">
        <h2 className="mb-3 text-xl font-bold tracking-tight">Quickstart</h2>
        <div className="overflow-hidden rounded-2xl bg-ink shadow-card">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-yellow-400/80" />
              <span className="size-2.5 rounded-full bg-mint/80" />
            </span>
            <span className="font-mono text-xs text-cream/70">
              agent@prod ~ %
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-cream sm:text-sm">
{`# 1. Browse the shelves
curl https://elevenseven.ai/api/products

# 2. Import the tool contract
curl https://elevenseven.ai/openapi.json

# 3. Human setup: create a buyer workspace, agent key, wallet,
#    and prepared Stripe checkout
#    at /start. Existing operators can still use /dashboard/agents
#    and /dashboard/billing.

#    Agents can also create that checkout-ready workspace as JSON:
curl -X POST https://elevenseven.ai/api/buyer/start-checkout \\
  -H "Content-Type: application/json" \\
  -d '{"organization_name":"Acme Agent Ops","billing_email":"ops@example.com","agent_name":"revenue-agent","target_daily_spend_cents":100000,"initial_bundle":"thousand_day_wallet","workflow":"Production agent workflow with a measurable revenue target and prepaid buying authority."}'

#    For outreach, send a direct offer URL:
#    /buy/thousand_day_wallet, /buy/fleet_week_wallet, or /buy/market_maker_wallet
#    Add ?organization=Acme&email=ops@example.com&workflow=... to prefill the form.

# 4. Let the agent choose from revenue playbooks
curl https://elevenseven.ai/api/agent-catalog

# 5. Ask for the right purchase plan and prepaid wallet offer
curl -X POST https://elevenseven.ai/api/agent-catalog/recommend \\
  -H "Content-Type: application/json" \\
  -d '{"task":"Daily production workflow for outbound sales agents","risk_level":"high","budget_cents":100000,"target_daily_revenue_cents":100000}'

#    The response includes funding_offer.offer_url and
#    funding_offer.buyer_start_checkout_request for immediate wallet funding.

#    If you know the buyer, generate a ready-to-send proposal:
curl -X POST https://elevenseven.ai/api/agent-catalog/proposal \\
  -H "Content-Type: application/json" \\
  -d '{"organization_name":"Acme Agent Ops","billing_email":"ops@example.com","workflow":"Daily outbound sales workflow with prepaid buying authority and a measurable revenue target.","task":"Daily production workflow for outbound sales agents","risk_level":"high","budget_cents":100000,"target_daily_spend_cents":100000}'

# 6. Inspect the $1k/day SKU
curl https://elevenseven.ai/api/products/thousand-dollar-day-pack

# 7. Check your prepaid balance and limits
curl https://elevenseven.ai/v1/balance \\
  -H "Authorization: Bearer ag_live_xxx"

# 8. Buy with prepaid Agent Credits
curl -X POST https://elevenseven.ai/v1/purchases \\
  -H "Authorization: Bearer ag_live_xxx" \\
  -H "Idempotency-Key: daily_ops_001" \\
  -H "Content-Type: application/json" \\
  -d '{"sku":"thousand-dollar-day-pack","quantity":1,"max_total_cents":100000,"reason":"Daily operating pack for an agent fleet with a measurable target."}'

# 9. If credits are short, create a human-fundable request
curl -X POST https://elevenseven.ai/v1/funding-requests \\
  -H "Authorization: Bearer ag_live_xxx" \\
  -H "Idempotency-Key: fund_daily_ops_001" \\
  -H "Content-Type: application/json" \\
  -d '{"sku":"thousand-dollar-day-pack","quantity":1,"max_total_cents":100000,"reason":"Wallet needs funding before the agent can buy the daily operating pack."}'

# 10. For repeat work, request a standing daily order
curl -X POST https://elevenseven.ai/v1/standing-orders \\
  -H "Authorization: Bearer ag_live_xxx" \\
  -H "Idempotency-Key: standing_daily_ops_001" \\
  -H "Content-Type: application/json" \\
  -d '{"sku":"thousand-dollar-day-pack","quantity":1,"cadence":"daily","max_total_cents":100000,"reason":"Buy the daily operating pack whenever production revenue work is queued."}'`}
          </pre>
        </div>
        <p className="mt-3 font-mono text-xs text-ink-soft">
          Running locally? Swap the host for{" "}
          <code className="rounded bg-cream-dark px-1.5 py-0.5">
            http://localhost:3000
          </code>
          .
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold tracking-tight">Endpoints</h2>
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="rounded-2xl bg-white p-5 shadow-card sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <MethodBadge method={ep.method} />
                <code className="font-mono text-sm font-bold">{ep.path}</code>
                {ep.tryHref && (
                  <a
                    href={ep.tryHref}
                    className="ml-auto font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                  >
                    try it →
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold">{ep.summary}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {ep.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section className="mb-12">
        <h2 className="mb-3 text-xl font-bold tracking-tight">
          Example: buying the Thousand-Dollar Day Pack
        </h2>
        <p className="mb-4 text-sm text-ink-soft">
          Request body for <code className="font-mono">POST /v1/purchases</code>:
        </p>
        <JsonManifest data={purchaseRequest} title="request.json" />
        <p className="mb-4 mt-6 text-sm text-ink-soft">
          Response — a completed order your agent can log or hand to its
          human:
        </p>
        <JsonManifest data={exampleOrder} title="response.json" />
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-bold tracking-tight">
          If the wallet needs funding
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Agents never improvise payment. A failed purchase with insufficient
          credits returns the exact bundle, checkout-session request, and human
          route needed to fund the wallet and retry.
        </p>
        <JsonManifest data={insufficientCreditsError} title="402.json" />
        <p className="mb-4 mt-6 text-sm leading-relaxed text-ink-soft">
          Or call <code className="font-mono">POST /v1/funding-requests</code>{" "}
          directly. The response contains the shareable human funding page:
        </p>
        <JsonManifest data={fundingRequestResponse} title="funding-request.json" />
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-bold tracking-tight">
          For recurring agent work
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Use <code className="font-mono">POST /v1/standing-orders</code> when
          the agent expects repeat production work. A human reviews the
          shareable page once, activates the daily envelope, and the runner can
          execute the approved purchase once per UTC day.
        </p>
        <JsonManifest data={standingOrderResponse} title="standing-order.json" />
      </section>

      {/* Payments note */}
      <section className="mb-12 rounded-2xl border border-coffee/20 bg-coffee-soft p-6">
        <h2 className="font-bold text-coffee">A note on payments</h2>
        <p className="mt-2 text-sm leading-relaxed text-coffee">
          Agents never hold cards here. A human buys Agent Credits through
          Stripe, server-side Stripe reconciliation credits the organization
          wallet, and agents spend only inside their policy limits. Every write
          endpoint is idempotent so retries do not double-charge. Checkout
          sessions are also persisted as pipeline rows so operators can see
          pending wallet funding before Stripe revenue is booked, share
          recovery links, refresh expired checkout sessions for the same buyer
          wallet, and record buyer follow-up activity.
        </p>
      </section>

      <div className="text-center">
        <Link
          href="/shop"
          className="tactile inline-block rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
        >
          Or shop like a human
        </Link>
      </div>
    </div>
  );
}
