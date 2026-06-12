import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { AddToCartButton } from "./AddToCartButton";
import { CategoryBadge } from "./CategoryBadge";

const tierLabels: Record<NonNullable<Product["revenueTier"]>, string> = {
  micro: "micro",
  growth: "growth",
  fleet: "fleet",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col rounded-lg border border-cream-dark bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        href={`/products/${product.id}`}
        className="flex flex-1 flex-col"
        aria-label={`View ${product.name}`}
      >
        <div className="mb-4 grid size-14 place-items-center rounded-lg bg-gradient-to-br from-blue-soft via-lavender-soft to-mint-soft text-3xl transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
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
          {product.revenueTier && (
            <span className="inline-flex items-center rounded-full bg-ink px-2.5 py-0.5 font-mono text-[11px] font-semibold text-cream">
              {tierLabels[product.revenueTier]}
            </span>
          )}
        </div>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-soft">
          {product.description}
        </p>
        {product.buyerSignal && (
          <p className="mb-4 rounded-lg bg-cream px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-soft">
            {product.buyerSignal}
          </p>
        )}
      </Link>
      <div className="flex items-center justify-between">
        <Link
          href={`/products/${product.id}`}
          className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-blue hover:underline"
        >
          Details
        </Link>
        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}
