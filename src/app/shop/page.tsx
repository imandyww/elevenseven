import type { Metadata } from "next";
import { products } from "@/lib/products";
import { absoluteUrl, pageAlternates, pageOpenGraph } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { ShopClient } from "./ShopClient";

const description =
  "Browse the full catalog of micro-upgrades for AI agents — verification, memory, compute, tools, and more, all under a dollar.";

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
  name: "Agent Dollar Store catalog",
  numberOfItems: products.length,
  itemListElement: products.map((product, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: product.name,
    url: absoluteUrl(`/products/${product.id}`),
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
          Twelve tiny upgrades, nothing over a dollar. Stack them, gift them,
          expense them.
        </p>
      </div>
      <ShopClient />
    </div>
  );
}
