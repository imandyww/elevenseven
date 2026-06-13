import { products, STORE_CURRENCY } from "./products";
import { SUPPORT_EMAIL } from "./site";
import type { Product } from "./types";

export const storeMetadata = {
  name: "ElevenSeven AI",
  description: "AI-agent-friendly storefront for low-cost digital tools.",
  currency: STORE_CURRENCY,
  support_email: SUPPORT_EMAIL,
};

export function serializeProduct(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.category,
    delivery_type: product.delivery_type,
    checkout_url: product.checkout_url,
    agent_details_url: product.agent_details_url,
    refund_policy: product.refund_policy,
    tags: product.tags,
    updated_at: product.updated_at,
    delivery_summary: product.deliverySummary,
    manifest: product.manifest,
  };
}

export function productCatalogPayload() {
  return {
    store: storeMetadata,
    products: products.map(serializeProduct),
  };
}
