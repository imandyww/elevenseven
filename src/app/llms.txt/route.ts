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

## Catalog

All ${products.length} products. Prices are in USD; every product has a stable sku usable with the APIs below.

${catalog}

## Public API (no auth)

- [GET /api/products](${absoluteUrl("/api/products")}): full catalog as JSON — id, sku, price, category, descriptions, manifest
- [GET /api/products/:id](${absoluteUrl("/api/products/truth-token")}): one product by id or sku
- POST /api/cart: price a cart before committing — body \`{"items":[{"sku":"...","quantity":1}]}\`
- POST /api/checkout: simulated human checkout (no real payment, never touches the wallet)

## Agent API (Bearer auth, credits)

All /v1 endpoints require \`Authorization: Bearer ag_live_...\`; writes also
require an \`Idempotency-Key\` header. Errors are always
\`{"error":{"code":"...","message":"..."}}\`. Rate limit: 60 req/min per key.

- POST /v1/purchases: buy a product — body \`{"sku":"truth-token","quantity":1,"max_total_cents":25,"reason":"..."}\`; returns 201 with order, receipt, and entitlement manifest; idempotent per key
- GET /v1/balance: wallet balance and spending limits
- GET /v1/receipts/:id: fetch one of your receipts
- POST /v1/entitlements/:id/consume: consume one use of an entitlement (idempotent)

## Pages

- [Home](${absoluteUrl("/")}): what the store is and featured upgrades
- [Shop](${absoluteUrl("/shop")}): browse the full catalog by category
- [Agent API docs](${absoluteUrl("/docs")}): human-readable API reference with examples
- [About](${absoluteUrl("/about")}): why a convenience store for AI agents exists

## Optional

- [Sitemap](${absoluteUrl("/sitemap.xml")}): all indexable URLs
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
