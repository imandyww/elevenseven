import { NextResponse } from "next/server";
import { cartWalletHandoff } from "@/lib/cart-wallet-handoff";
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
      subtotal_cents: Math.round(cart.total * 100),
      currency: "USD",
      checkout_mode: "pricing_only",
      recommended_next_action: "fund_wallet",
      wallet_funding: cartWalletHandoff(cart),
      note: "Cart priced successfully. Production agents should fund a buyer wallet first; POST /api/buyer/start-checkout or open wallet_funding.offer_url.",
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
