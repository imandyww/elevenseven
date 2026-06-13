import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  getProduct,
  productPath,
  products,
} from "@/lib/products";
import { absoluteUrl, pageAlternates, pageOpenGraph, SITE_NAME } from "@/lib/site";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CategoryBadge } from "@/components/CategoryBadge";
import { JsonLd } from "@/components/JsonLd";
import { JsonManifest } from "@/components/JsonManifest";
import { ProductCard } from "@/components/ProductCard";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Product not found" };
  const title = `${product.name} - ${formatPrice(product.price)} digital product`;
  return {
    title: product.name,
    description: product.description,
    alternates: pageAlternates(productPath(product)),
    openGraph: pageOpenGraph({
      title,
      description: product.description,
      path: productPath(product),
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

  const agentReadableProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    category: product.category,
    delivery_type: product.delivery_type,
    checkout_url: product.checkout_url,
    agent_details_url: product.agent_details_url,
    refund_policy: product.refund_policy,
    tags: product.tags,
    updated_at: product.updated_at,
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.longDescription,
    category: product.category,
    url: absoluteUrl(productPath(product)),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(product.checkout_url),
      seller: { "@id": absoluteUrl("/#organization") },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Products", item: absoluteUrl("/products") },
      {
        "@type": "ListItem",
        position: 2,
        name: product.name,
        item: absoluteUrl(productPath(product)),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <nav className="mb-6 font-mono text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-blue">
          products
        </Link>{" "}
        / <span className="text-ink">{product.slug}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-lg border border-cream-dark bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-6 grid size-24 place-items-center rounded-lg bg-gradient-to-br from-blue-soft via-mint-soft to-lavender-soft font-mono text-2xl font-bold text-ink shadow-card">
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
            <div className="mt-6">
              <AddToCartButton productId={product.id} size="lg" label="Buy" />
            </div>
            <p className="mt-4 font-mono text-[11px] text-ink-soft/75">
              sku: {product.sku} · {product.delivery_type.replaceAll("_", " ")}
            </p>
            <Link
              href={product.agent_details_url}
              prefetch={false}
              className="mt-4 inline-block font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
            >
              Agent-readable details
            </Link>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-3">
          <section className="rounded-lg bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">
              What the buyer receives
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              {product.longDescription}
            </p>
            <p className="mt-4 rounded-lg bg-cream px-4 py-3 text-sm leading-relaxed text-ink-soft">
              {product.deliverySummary}
            </p>
          </section>

          <section className="rounded-lg bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">
              Why it is useful
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              {product.buyerSignal}
            </p>
            <div className="mt-4 rounded-lg border-l-4 border-mint bg-mint-soft/50 p-4">
              <p className="text-sm leading-relaxed text-ink-soft">
                {product.useCase}
              </p>
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">
              Checkout and refund policy
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-mono text-xs font-semibold text-blue">
                  Checkout URL
                </dt>
                <dd className="mt-1 break-all text-ink-soft">
                  {product.checkout_url}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-semibold text-blue">
                  Delivery
                </dt>
                <dd className="mt-1 text-ink-soft">
                  Instant digital delivery unless otherwise stated.
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-xs font-semibold text-blue">
                  Refund policy
                </dt>
                <dd className="mt-1 text-ink-soft">{product.refund_policy}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold tracking-tight">
              Machine-readable product metadata
            </h2>
            <JsonManifest
              data={agentReadableProduct}
              title={`${product.slug}.json`}
            />
          </section>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold tracking-tight">
          Related products
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
