import { startOfUtcDay } from "./credits";
import {
  openCheckoutFollowupState,
  type OpenCheckoutFollowupState,
} from "./checkout-recovery";
import { prisma } from "./db";
import { formatCents } from "./money";
import {
  getRevenueOutreachQueue,
  type RevenueOutreachItem,
} from "./revenue-outreach";
import { revenueOffers } from "./revenue-offers";
import { absoluteUrl, isLocalOrigin, type UrlOptions } from "./site";

const TARGET_DAILY_REVENUE_CENTS = 100000;

export type ClosePlanStatus =
  | "target_met"
  | "open_checkouts_can_close"
  | "pipeline_needed";

export interface ClosePlanAction {
  id: string;
  type: string;
  label: string;
  amount_cents: number;
  url: string;
  mailto_url: string | null;
  next_action: string;
  reason: string;
  checkout_state?: OpenCheckoutFollowupState;
}

function toClosePlanAction(item: RevenueOutreachItem): ClosePlanAction {
  return {
    id: item.id,
    type: item.type,
    label: item.label,
    amount_cents: item.amount_cents,
    url: item.url,
    mailto_url: item.mailto_url,
    next_action: item.next_action,
    reason: item.reason,
    checkout_state: item.checkout_state,
  };
}

function closeActions(
  items: RevenueOutreachItem[],
  remainingCents: number,
): ClosePlanAction[] {
  let covered = 0;
  const actions: ClosePlanAction[] = [];

  for (const item of items) {
    if (covered >= remainingCents) break;
    actions.push(toClosePlanAction(item));
    covered += item.amount_cents;
  }

  return actions;
}

function buyerLinkReadiness(options: UrlOptions = {}) {
  const origin = new URL(absoluteUrl("/", options)).origin;
  const localOnly = isLocalOrigin(origin);

  return {
    status: localOnly ? "local_only" : "public",
    origin,
    action: localOnly
      ? "Call this endpoint from the public buyer-facing origin or set NEXT_PUBLIC_APP_URL to that origin before sending buyer checkout or recovery links."
      : "Buyer checkout and recovery links are using a public origin.",
  };
}

export async function getRevenueClosePlan(options: UrlOptions = {}) {
  const today = startOfUtcDay();
  const now = new Date();
  const [todayCreditStats, openCheckoutIntents, outreachQueue] = await Promise.all([
    prisma.ledgerEntry.aggregate({
      where: {
        type: "credit",
        source: "stripe_checkout",
        createdAt: { gte: today },
      },
      _sum: { amountCents: true },
      _count: { id: true },
    }),
    prisma.checkoutIntent.findMany({
      where: { status: "open" },
      select: {
        amountCents: true,
        checkoutUrl: true,
        recoveryToken: true,
        expiresAt: true,
      },
    }),
    getRevenueOutreachQueue(50, options),
  ]);

  const cashRevenueTodayCents = todayCreditStats._sum.amountCents ?? 0;
  const remainingCents = Math.max(
    0,
    TARGET_DAILY_REVENUE_CENTS - cashRevenueTodayCents,
  );
  const openCheckoutCents = openCheckoutIntents.reduce(
    (sum, intent) => sum + intent.amountCents,
    0,
  );
  const openCheckoutCount = openCheckoutIntents.length;
  const refreshableCheckoutCents = openCheckoutIntents
    .filter(
      (intent) =>
        openCheckoutFollowupState(intent, now) === "refreshable_recovery",
    )
    .reduce((sum, intent) => sum + intent.amountCents, 0);
  const refreshableCheckoutCount = openCheckoutIntents.filter(
    (intent) => openCheckoutFollowupState(intent, now) === "refreshable_recovery",
  ).length;
  const checkoutActions = closeActions(
    outreachQueue.items.filter((item) => item.type === "checkout"),
    remainingCents,
  );
  const allActions = closeActions(outreachQueue.items, remainingCents);
  const parallelCloseActions = outreachQueue.items
    .filter((item) => item.type === "checkout" || item.type === "pilot_lead")
    .slice(0, 5)
    .map(toClosePlanAction);
  const checkoutActionCents = checkoutActions.reduce(
    (sum, action) => sum + action.amount_cents,
    0,
  );
  const totalActionCents = allActions.reduce(
    (sum, action) => sum + action.amount_cents,
    0,
  );
  const uncoveredAfterOpenCheckoutsCents = Math.max(
    0,
    remainingCents - openCheckoutCents,
  );
  const neededThousandDayWallets = Math.ceil(
    uncoveredAfterOpenCheckoutsCents / TARGET_DAILY_REVENUE_CENTS,
  );

  const status: ClosePlanStatus =
    remainingCents === 0
      ? "target_met"
      : openCheckoutCents >= remainingCents
        ? "open_checkouts_can_close"
        : "pipeline_needed";

  return {
    generated_at: new Date().toISOString(),
    utc_day: today.toISOString().slice(0, 10),
    target_daily_revenue_cents: TARGET_DAILY_REVENUE_CENTS,
    cash_revenue_today_cents: cashRevenueTodayCents,
    cash_revenue_event_count: todayCreditStats._count.id,
    remaining_cents: remainingCents,
    status,
    buyer_link_readiness: buyerLinkReadiness(options),
    open_checkout_count: openCheckoutCount,
    open_checkout_cents: openCheckoutCents,
    refreshable_checkout_count: refreshableCheckoutCount,
    refreshable_checkout_cents: refreshableCheckoutCents,
    open_checkout_coverage_cents: Math.min(openCheckoutCents, remainingCents),
    uncovered_after_open_checkouts_cents: uncoveredAfterOpenCheckoutsCents,
    checkout_actions: checkoutActions,
    checkout_actions_coverage_cents: Math.min(checkoutActionCents, remainingCents),
    all_actions: allActions,
    all_actions_coverage_cents: Math.min(totalActionCents, remainingCents),
    parallel_close_actions: parallelCloseActions,
    parallel_close_actions_total_cents: parallelCloseActions.reduce(
      (sum, action) => sum + action.amount_cents,
      0,
    ),
    parallel_close_instruction:
      remainingCents === 0
        ? "No close actions needed today."
        : "Send every parallel close action now; any one $1k wallet checkout can clear today's remaining revenue gap.",
    new_pipeline_needed: {
      cents: uncoveredAfterOpenCheckoutsCents,
      thousand_day_wallets: neededThousandDayWallets,
      start_url: absoluteUrl("/start", options),
      offer_url: absoluteUrl("/buy/thousand_day_wallet", options),
      direct_offer_urls: revenueOffers(options).map((offer) => ({
        bundle: offer.bundle.id,
        name: offer.bundle.name,
        price_cents: offer.bundle.priceCents,
        url: offer.url,
      })),
      buyer_start_checkout_endpoint: {
        method: "POST",
        path: "/api/buyer/start-checkout",
        body: {
          organization_name: "Buyer name",
          billing_email: "buyer@example.com",
          agent_name: "revenue-agent",
          target_daily_spend_cents: TARGET_DAILY_REVENUE_CENTS,
          initial_bundle: "thousand_day_wallet",
          workflow:
            "Production agent workflow with a measurable revenue target and prepaid buying authority.",
        },
      },
    },
    summary:
      remainingCents === 0
        ? `Target met: ${formatCents(cashRevenueTodayCents)} booked today.`
        : openCheckoutCents >= remainingCents
          ? refreshableCheckoutCents > 0
            ? `Follow up live and refreshable checkout recovery links to close the ${formatCents(remainingCents)} remaining today.`
            : `Follow up open checkouts to close the ${formatCents(remainingCents)} remaining today.`
          : `Create ${neededThousandDayWallets} more $1k wallet checkout${neededThousandDayWallets === 1 ? "" : "s"} after following up open checkouts.`,
  };
}
