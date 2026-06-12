import type { Product } from "./types";

/** Catalog prices are dollar floats; all payment code works in integer cents. */
export function priceCents(product: Product): number {
  return Math.round(product.price * 100);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
