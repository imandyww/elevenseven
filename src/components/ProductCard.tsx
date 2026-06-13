import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, productPath } from "@/lib/products";
import { AddToCartButton } from "./AddToCartButton";
import { CategoryBadge } from "./CategoryBadge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex min-h-full flex-col rounded-lg border border-cream-dark bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <Link
        href={productPath(product)}
        className="flex flex-1 flex-col"
        aria-label={`View ${product.name}`}
      >
        <div className="mb-4 grid size-12 place-items-center rounded-lg bg-gradient-to-br from-blue-soft via-mint-soft to-lavender-soft font-mono text-sm font-bold text-ink transition-transform duration-200 group-hover:scale-105">
          {product.icon}
        </div>
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-wrap font-bold tracking-tight group-hover:text-blue">
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-sm font-bold text-coffee">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={product.category} />
          <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
            instant digital
          </span>
        </div>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-soft">
          {product.description}
        </p>
        <p className="mb-4 rounded-lg bg-cream px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-soft">
          {product.deliverySummary}
        </p>
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={product.agent_details_url}
          prefetch={false}
          className="font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
        >
          Agent-readable details
        </Link>
        <AddToCartButton productId={product.id} label="Buy" />
      </div>
    </div>
  );
}
