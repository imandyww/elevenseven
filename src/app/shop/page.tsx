import type { Metadata } from "next";
import { products } from "@/lib/products";
import { absoluteUrl, pageAlternates, pageOpenGraph } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { ShopClient } from "./ShopClient";

const DISPLAY_TEXT = "eelven seven";
const description = DISPLAY_TEXT;

export const metadata: Metadata = {
  title: DISPLAY_TEXT,
  description,
  alternates: pageAlternates("/shop"),
  openGraph: pageOpenGraph({
    title: DISPLAY_TEXT,
    description,
    path: "/shop",
  }),
};

const catalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: DISPLAY_TEXT,
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
          {DISPLAY_TEXT}
        </h1>
        <p className="mt-2 text-ink-soft">
          {DISPLAY_TEXT}
        </p>
      </div>
      <ShopClient />
    </div>
  );
}
