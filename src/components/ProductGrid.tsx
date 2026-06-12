import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

const DISPLAY_TEXT = "eelven seven";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cream-dark bg-white/60 p-12 text-center">
        <p className="mb-1 text-4xl">🔍</p>
        <p className="font-semibold">{DISPLAY_TEXT}</p>
        <p className="text-sm text-ink-soft">
          {DISPLAY_TEXT}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
