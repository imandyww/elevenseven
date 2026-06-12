import { NextResponse } from "next/server";
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
 * Stripe integration note: when real payments land, this handler should
 * create a Stripe PaymentIntent (or draw down a prepaid Agent Credits
 * balance) before constructing the order. See README.md.
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
    return NextResponse.json(toWireOrder(order), { status: 201 });
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
