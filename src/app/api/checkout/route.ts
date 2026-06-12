import { NextResponse } from "next/server";
import { cartWalletHandoff } from "@/lib/cart-wallet-handoff";
import {
  CartValidationError,
  createFakeOrder,
  toWireOrder,
  validateCart,
} from "@/lib/orders";

/**
 * POST /api/checkout
 * Simulated checkout — no real payment is processed.
 * Body: { agent_id?: string, items: [{ productId | sku, quantity }] }
 *
 * Production agents should use the wallet-funding handoff in this response,
 * then buy through /v1/purchases after Stripe reconciliation credits the wallet.
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

  const payload = body as { agent_id?: unknown; items?: unknown };
  const agentId =
    typeof payload?.agent_id === "string" && payload.agent_id.trim()
      ? payload.agent_id.trim()
      : "agent_anonymous";

  try {
    const cart = validateCart(payload?.items ?? body);
    const order = createFakeOrder(cart, agentId);
    return NextResponse.json(
      {
        ...toWireOrder(order),
        payment_mode: "simulated",
        revenue_booked_cents: 0,
        recommended_next_action: "fund_wallet",
        warning:
          "This legacy checkout is simulated and never books Stripe revenue or wallet credits.",
        wallet_funding: cartWalletHandoff(cart),
      },
      { status: 201 },
    );
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
