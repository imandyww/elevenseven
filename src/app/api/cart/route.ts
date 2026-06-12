import { NextResponse } from "next/server";
import { CartValidationError, validateCart } from "@/lib/orders";

/**
 * POST /api/cart
 * Price a cart without purchasing. Body: { items: [{ productId | sku, quantity }] }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  try {
    const items = (body as { items?: unknown })?.items ?? body;
    const cart = validateCart(items);
    return NextResponse.json({
      items: cart.orderItems,
      subtotal: cart.total,
      currency: "USD",
      note: "Cart priced successfully. POST /api/checkout to complete the purchase.",
    });
  } catch (e) {
    if (e instanceof CartValidationError) {
      return NextResponse.json(
        { error: "INVALID_CART", message: e.message },
        { status: 400 },
      );
    }
    throw e;
  }
}
