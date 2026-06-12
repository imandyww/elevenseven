import { getProduct } from "./products";
import type { CartItem, Order, OrderItem, Product, WireOrder } from "./types";

export interface ValidatedCart {
  items: Array<{ product: Product; quantity: number }>;
  orderItems: OrderItem[];
  total: number;
}

export class CartValidationError extends Error {}

/**
 * Validate a raw cart payload (from the API or the client) into priced,
 * strongly typed line items. Throws CartValidationError on bad input.
 */
export function validateCart(input: unknown): ValidatedCart {
  if (!Array.isArray(input) || input.length === 0) {
    throw new CartValidationError(
      "Cart must be a non-empty array of { productId, quantity }.",
    );
  }

  const items = input.map((raw) => {
    const item = raw as Partial<CartItem> & { sku?: string };
    const id = item.productId ?? item.sku;
    if (typeof id !== "string") {
      throw new CartValidationError(
        "Each cart item needs a productId (or sku) string.",
      );
    }
    const product = getProduct(id);
    if (!product) {
      throw new CartValidationError(`Unknown product: "${id}".`);
    }
    const quantity = item.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new CartValidationError(
        `Quantity for "${id}" must be an integer between 1 and 99.`,
      );
    }
    return { product, quantity };
  });

  const orderItems: OrderItem[] = items.map(({ product, quantity }) => ({
    sku: product.sku,
    name: product.name,
    quantity,
    unit_price: product.price,
  }));

  const total =
    Math.round(
      items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0) *
        100,
    ) / 100;

  return { items, orderItems, total };
}

/** Build a fake completed order from a validated cart. */
export function createFakeOrder(cart: ValidatedCart, agentId: string): Order {
  const suffix = Math.random().toString(36).slice(2, 8);
  const upgradeTypes = [
    ...new Set(cart.items.map(({ product }) => product.manifest.upgrade_type)),
  ];
  const totalUses = cart.items.reduce(
    (sum, { product, quantity }) => sum + product.manifest.allowed_uses * quantity,
    0,
  );

  return {
    orderId: `agent_order_${suffix}`,
    agentId,
    items: cart.orderItems,
    total: cart.total,
    status: "completed",
    createdAt: new Date().toISOString(),
    manifest: {
      upgrade_type: upgradeTypes.join("+"),
      allowed_uses: totalUses,
      expires: "never",
    },
  };
}

/** Serialize an order into the snake_case wire format used by the agent API. */
export function toWireOrder(order: Order): WireOrder {
  return {
    order_id: order.orderId,
    agent_id: order.agentId,
    items: order.items,
    total: order.total,
    status: order.status,
    created_at: order.createdAt,
    manifest: order.manifest,
  };
}

/** Parse a wire-format order back into the internal Order shape. */
export function fromWireOrder(wire: WireOrder): Order {
  return {
    orderId: wire.order_id,
    agentId: wire.agent_id,
    items: wire.items,
    total: wire.total,
    status: wire.status,
    createdAt: wire.created_at,
    manifest: wire.manifest,
  };
}
