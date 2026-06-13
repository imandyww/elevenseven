import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/products";
import { absoluteUrl, pageAlternates, pageOpenGraph } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { ProductGrid } from "@/components/ProductGrid";

const description =
  "Browse ElevenSeven AI's catalog of $1 digital prompts, templates, utilities, scripts, and workflow helpers for humans and AI agents.";

export const metadata: Metadata = {
  title: "Products",
  description,
  alternates: pageAlternates("/products"),
  openGraph: pageOpenGraph({
    title: "Products",
    description,
    path: "/products",
  }),
};

const catalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "ElevenSeven AI product catalog",
  numberOfItems: products.length,
  itemListElement: products.map((product, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: product.name,
    url: absoluteUrl(`/products/${product.slug}`),
  })),
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd data={catalogJsonLd} />
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
            Storefront catalog
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Products
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
            Low-cost digital products for AI workflows: prompts, utilities,
            templates, scripts, checklists, and small workflow helpers. Every
            product lists a price, delivery type, refund policy, and
            agent-readable details.
          </p>
        </div>
        <div className="rounded-lg border border-cream-dark bg-white p-4 shadow-card">
          <p className="font-mono text-xs font-semibold text-blue">
            Agent metadata
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <Link
              href="/products.json"
              prefetch={false}
              className="font-mono font-semibold text-ink underline-offset-4 hover:text-blue hover:underline"
            >
              /products.json
            </Link>
            <Link
              href="/llms.txt"
              prefetch={false}
              className="font-mono font-semibold text-ink underline-offset-4 hover:text-blue hover:underline"
            >
              /llms.txt
            </Link>
          </div>
        </div>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
