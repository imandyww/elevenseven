import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/lib/products";
import { absoluteUrl, pageAlternates, pageOpenGraph, SITE_NAME } from "@/lib/site";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CategoryBadge } from "@/components/CategoryBadge";
import { JsonLd } from "@/components/JsonLd";
import { JsonManifest } from "@/components/JsonManifest";
import { ProductCard } from "@/components/ProductCard";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const tierCopy = {
  micro: "Low-risk impulse purchase for frequent agent loops.",
  growth: "Higher-intent purchase for production workflows and launch gates.",
  fleet: "Fleet-priced item for budgeted agents operating under human-approved limits.",
} as const;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Product not found" };
  const title = `${product.name} — ${formatPrice(product.price)} ${product.category} upgrade for AI agents`;
  return {
    title: product.name,
    description: product.description,
    alternates: pageAlternates(`/products/${product.id}`),
    openGraph: pageOpenGraph({
      title,
      description: product.description,
      path: `/products/${product.id}`,
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, 3);

  const purchaseOutput = {
    sku: product.sku,
    name: product.name,
    unit_price: product.price,
    manifest: product.manifest,
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.longDescription,
    category: product.category,
    url: absoluteUrl(`/products/${product.id}`),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/products/${product.id}`),
      seller: { "@id": absoluteUrl("/#organization") },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: absoluteUrl("/shop") },
      {
        "@type": "ListItem",
        position: 2,
        name: product.name,
        item: absoluteUrl(`/products/${product.id}`),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <nav className="mb-6 font-mono text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-blue">
          shop
        </Link>{" "}
        / <span className="text-ink">{product.id}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Big product card */}
        <div className="lg:col-span-2">
          <div className="hero-gradient sticky top-24 rounded-2xl bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-6 grid size-32 animate-float place-items-center rounded-3xl bg-gradient-to-br from-blue-soft via-lavender-soft to-mint-soft text-7xl shadow-card">
              {product.icon}
            </div>
            <CategoryBadge category={product.category} />
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-2 font-mono text-2xl font-bold text-coffee">
              {formatPrice(product.price)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
            {product.revenueTier && (
              <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-soft">
                {tierCopy[product.revenueTier]}
              </p>
            )}
            <div className="mt-6">
              <AddToCartButton productId={product.id} size="lg" />
            </div>
            <p className="mt-4 font-mono text-[11px] text-ink-soft/70">
              sku: {product.sku} · digital delivery · instant activation
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-8 lg:col-span-3">
          <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">
              What this does for your agent
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              {product.longDescription}
            </p>
          </section>

          {product.buyerSignal && (
            <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-lg font-bold tracking-tight">
                Why an agent buys it
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {product.buyerSignal}
              </p>
            </section>
          )}

          <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">
              Example use case
            </h2>
            <div className="mt-3 rounded-xl border-l-4 border-mint bg-mint-soft/50 p-4">
              <p className="text-sm leading-relaxed text-ink-soft">
                {product.useCase}
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold tracking-tight">
              Machine-readable purchase output
            </h2>
            <JsonManifest
              data={purchaseOutput}
              title={`${product.sku}.manifest.json`}
            />
          </section>
        </div>
      </div>

      {/* Related */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold tracking-tight">
          Agents also bought
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
