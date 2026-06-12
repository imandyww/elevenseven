import type { ValidatedCart } from "./orders";
import { formatCents } from "./money";
import { prefilledStartUrl } from "./start-prefill";

const CART_REVENUE_BUNDLE = "thousand_day_wallet";
const CART_AGENT_NAME = "cart-buyer-agent";
const TARGET_DAILY_SPEND_CENTS = 100000;

function cartSubtotalCents(cart: ValidatedCart) {
  return Math.round(cart.total * 100);
}

function cartWorkflow(cart: ValidatedCart) {
  const lines = cart.orderItems
    .map((item) => `${item.quantity}x ${item.name} (${item.sku})`)
    .join(", ");

  return `Production agent cart requested ${lines}. Fund the buyer wallet first, then let the agent buy these catalog items from prepaid credits. Cart subtotal is ${formatCents(cartSubtotalCents(cart))}; recommended initial wallet funding is ${formatCents(TARGET_DAILY_SPEND_CENTS)}.`;
}

export function cartWalletHandoff(cart: ValidatedCart) {
  const workflow = cartWorkflow(cart);

  return {
    mode: "wallet_funding_required",
    reason:
      "Legacy cart checkout is simulated and does not book Stripe revenue. Production agents need a human-funded wallet before buying.",
    recommended_bundle: CART_REVENUE_BUNDLE,
    target_daily_spend_cents: TARGET_DAILY_SPEND_CENTS,
    expected_cash_revenue_cents: TARGET_DAILY_SPEND_CENTS,
    cart_subtotal_cents: cartSubtotalCents(cart),
    start_url: prefilledStartUrl("/start", {
      agentName: CART_AGENT_NAME,
      workflow,
    }),
    offer_url: prefilledStartUrl(`/buy/${CART_REVENUE_BUNDLE}`, {
      agentName: CART_AGENT_NAME,
      workflow,
    }),
    buyer_start_checkout_request: {
      method: "POST",
      path: "/api/buyer/start-checkout",
      body: {
        organization_name: "Buyer name",
        billing_email: "buyer@example.com",
        agent_name: CART_AGENT_NAME,
        target_daily_spend_cents: TARGET_DAILY_SPEND_CENTS,
        initial_bundle: CART_REVENUE_BUNDLE,
        workflow,
      },
    },
    post_funding_purchase_requests: cart.orderItems.map((item) => ({
      method: "POST",
      path: "/v1/purchases",
      body: {
        sku: item.sku,
        quantity: item.quantity,
        max_total_cents: Math.round(item.unit_price * item.quantity * 100),
        reason: `Buy ${item.quantity}x ${item.name} from the funded buyer wallet.`,
      },
    })),
  };
}
