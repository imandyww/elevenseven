import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/products";
import { pageAlternates } from "@/lib/site";
import { JsonManifest } from "@/components/JsonManifest";

export const metadata: Metadata = {
  title: "Agent API",
  description:
    "Agent-readable catalog, product metadata, and purchase surfaces for ElevenSeven AI digital goods.",
  alternates: pageAlternates("/docs"),
};

const catalogExample = {
  store: {
    name: "ElevenSeven AI",
    description: "AI-agent-friendly storefront for low-cost digital tools.",
    currency: "USD",
    support_email: "support@elevenseven.ai",
  },
  products: [
    {
      id: "landing-page-copy-fixer",
      slug: "landing-page-copy-fixer",
      name: "Landing Page Copy Fixer",
      price: 1,
      currency: "USD",
      category: "Copywriting",
      delivery_type: "instant_digital_download",
      checkout_url: "/cart?sku=landing-page-copy-fixer",
      agent_details_url: "/api/products/landing-page-copy-fixer",
      refund_policy:
        "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
      tags: ["landing-page", "copywriting", "conversion", "prompt"],
      updated_at: "2026-06-13",
    },
  ],
};

const purchaseRequest = {
  sku: "landing-page-copy-fixer",
  quantity: 1,
  max_total_cents: 100,
  reason: "User approved a $1 prompt to fix vague landing page copy.",
};

const endpoints = [
  {
    method: "GET",
    path: "/products.json",
    summary: "Fetch the full product catalog in agent-readable JSON.",
    href: "/products.json",
  },
  {
    method: "GET",
    path: "/api/products/:id",
    summary: "Fetch one product by id, slug, or sku.",
    href: "/api/products/landing-page-copy-fixer",
  },
  {
    method: "GET",
    path: "/llms.txt",
    summary: "Read plain-text instructions for AI agents and crawlers.",
    href: "/llms.txt",
  },
  {
    method: "GET",
    path: "/openapi.json",
    summary: "Import the broader OpenAPI contract for wallet and purchase APIs.",
    href: "/openapi.json",
  },
  {
    method: "POST",
    path: "/api/cart",
    summary: "Price a cart before a simulated checkout or payment-provider handoff.",
  },
  {
    method: "POST",
    path: "/v1/purchases",
    summary:
      "Authenticated agent purchase endpoint for prepaid-credit flows. Requires user-approved agent credentials.",
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
          Agent API
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Agent-readable commerce surfaces
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          ElevenSeven publishes product pages for humans and structured
          metadata for AI agents. Agents should read the catalog, compare price
          and delivery details, confirm user consent, then use the product
          checkout_url or authenticated purchase API where configured.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-card">
          <p className="font-mono text-xs font-semibold text-blue">Catalog</p>
          <p className="mt-2 text-sm text-ink-soft">
            {products.length} products, currently priced at $1 USD each.
          </p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-card">
          <p className="font-mono text-xs font-semibold text-blue">Delivery</p>
          <p className="mt-2 text-sm text-ink-soft">
            Digital goods with instant delivery unless a product says otherwise.
          </p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-card">
          <p className="font-mono text-xs font-semibold text-blue">Consent</p>
          <p className="mt-2 text-sm text-ink-soft">
            Agents should purchase only with clear user consent and budget.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Endpoints</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {endpoints.map((endpoint) => (
            <div
              key={`${endpoint.method} ${endpoint.path}`}
              className="rounded-lg border border-cream-dark bg-white p-5 shadow-card"
            >
              <p className="font-mono text-xs font-semibold text-blue">
                {endpoint.method}
              </p>
              <p className="mt-1 break-all font-mono text-sm font-bold">
                {endpoint.path}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {endpoint.summary}
              </p>
              {endpoint.href && (
                <Link
                  href={endpoint.href}
                  prefetch={false}
                  className="mt-3 inline-block font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                >
                  Open endpoint
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-bold tracking-tight">
            Catalog response shape
          </h2>
          <JsonManifest data={catalogExample} title="products.json" />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold tracking-tight">
            Purchase request example
          </h2>
          <JsonManifest data={purchaseRequest} title="purchase-request.json" />
        </div>
      </section>
    </div>
  );
}
