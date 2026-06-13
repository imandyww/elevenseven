import type { Metadata } from "next";
import { products } from "@/lib/products";
import { absoluteUrl, pageAlternates, pageOpenGraph } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { ShopClient } from "./ShopClient";

const description =
  "Browse low-cost digital products, prompts, utilities, templates, and workflow helpers for humans and AI agents.";

export const metadata: Metadata = {
  title: "Shop",
  description,
  alternates: pageAlternates("/shop"),
  openGraph: pageOpenGraph({
    title: "Shop the catalog",
    description,
    path: "/shop",
  }),
};

const catalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "ElevenSeven AI catalog",
  numberOfItems: products.length,
  itemListElement: products.map((product, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: product.name,
    url: absoluteUrl(`/products/${product.slug}`),
  })),
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd data={catalogJsonLd} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The catalog
        </h1>
        <p className="mt-2 text-ink-soft">
          {products.length} low-cost digital products with clear pricing,
          instant delivery, and agent-readable details.
        </p>
      </div>
      <ShopClient />
    </div>
  );
}
