import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates } from "@/lib/site";
import { JsonManifest } from "@/components/JsonManifest";

export const metadata: Metadata = {
  title: "Agent API",
  description:
    "Browse and buy micro-upgrades programmatically. JSON in, JSON out, receipts always.",
  alternates: pageAlternates("/docs"),
};

const exampleOrder = {
  order_id: "agent_order_123",
  agent_id: "agent_17",
  items: [
    {
      sku: "truth-token",
      name: "Truth Token",
      quantity: 1,
      unit_price: 0.25,
    },
  ],
  total: 0.25,
  status: "completed",
  manifest: {
    upgrade_type: "verification",
    allowed_uses: 1,
    expires: "never",
  },
};

const checkoutRequest = {
  agent_id: "agent_17",
  items: [{ sku: "truth-token", quantity: 1 }],
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
    path: "/api/products",
    summary: "List the full catalog.",
    details:
      "Returns every product with id, sku, price, category, descriptions, and a machine-readable manifest. No auth, no pagination — there are twelve products; you can handle it.",
    tryHref: "/api/products",
  },
  {
    method: "GET",
    path: "/api/products/:id",
    summary: "Fetch one product by id or sku.",
    details:
      "Returns a single product, or a 404 with a helpful error body if your agent invented a SKU that doesn't exist. (Consider a Truth Token.)",
    tryHref: "/api/products/truth-token",
  },
  {
    method: "POST",
    path: "/api/cart",
    summary: "Price a cart before committing.",
    details:
      'Send { "items": [{ "sku": "...", "quantity": n }] } and get back priced line items and a subtotal. Useful for agents that check their budget before they spend it. All of them, ideally.',
  },
  {
    method: "POST",
    path: "/api/checkout",
    summary: "Complete a (simulated) purchase.",
    details:
      'Send { "agent_id": "...", "items": [...] } and receive a completed order with an order_id, totals, and an upgrade manifest. No real payment is processed yet — see the payments note below.',
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
          AGENT API · v1 · no auth required (yet)
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Shop programmatically
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          The storefront is for humans. This is for you. Every product,
          cart, and order is available as clean JSON, so your agent can browse
          the shelves, price a basket, and check out — all inside a single
          tool call.
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

# 2. Inspect something tasty
curl https://elevenseven.ai/api/products/truth-token

# 3. Price your basket
curl -X POST https://elevenseven.ai/api/cart \\
  -H "Content-Type: application/json" \\
  -d '{"items":[{"sku":"truth-token","quantity":1}]}'

# 4. Check out
curl -X POST https://elevenseven.ai/api/checkout \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"agent_17","items":[{"sku":"truth-token","quantity":1}]}'`}
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
          Example: buying a Truth Token
        </h2>
        <p className="mb-4 text-sm text-ink-soft">
          Request body for <code className="font-mono">POST /api/checkout</code>:
        </p>
        <JsonManifest data={checkoutRequest} title="request.json" />
        <p className="mb-4 mt-6 text-sm text-ink-soft">
          Response — a completed order your agent can log or hand to its
          human:
        </p>
        <JsonManifest data={exampleOrder} title="response.json" />
      </section>

      {/* Payments note */}
      <section className="mb-12 rounded-2xl border border-coffee/20 bg-coffee-soft p-6">
        <h2 className="font-bold text-coffee">A note on payments</h2>
        <p className="mt-2 text-sm leading-relaxed text-coffee">
          Checkout is currently simulated. Real payments would use prepaid
          Agent Credits or bundles to avoid microtransaction fees — card
          processing on a $0.10 Reputation Sticker is a rounding error&apos;s
          rounding error. The checkout handler is structured so a Stripe
          PaymentIntent (or a credits ledger) can drop in without changing the
          API contract.
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
