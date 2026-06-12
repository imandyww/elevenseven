import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  checkoutHasUsableStripeSession,
  openCheckoutFollowupState,
} from "@/lib/checkout-recovery";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { startOfUtcDay } from "@/lib/credits";
import { getRevenueClosePlan } from "@/lib/revenue-close-plan";
import { getRevenueOutreachQueue } from "@/lib/revenue-outreach";
import { getRevenueReadiness } from "@/lib/revenue-readiness";
import { getRevenueSalesKit } from "@/lib/revenue-sales-kit";
import { originFromHeaders } from "@/lib/site";
import {
  activateStandingOrder,
  backfillCheckoutRecoveryLinks,
  cancelStandingOrder,
  markCheckoutFollowedUp,
  pauseStandingOrder,
  syncOpenCheckoutPayments,
  updatePilotLeadStatus,
} from "../actions";

export const metadata: Metadata = { title: "Revenue" };
export const dynamic = "force-dynamic";

const DAILY_TARGET_CENTS = 100000;
const DAY_MS = 24 * 60 * 60 * 1000;
const openPilotStatuses = new Set(["new", "contacted"]);
const pilotLeadNextStatuses = ["new", "contacted", "won", "lost"] as const;
const pilotLeadStatusStyles: Record<string, string> = {
  new: "bg-blue-soft text-blue",
  contacted: "bg-mint-soft text-emerald-700",
  won: "bg-coffee-soft text-coffee",
  lost: "bg-cream-dark text-ink-soft",
};
const standingOrderStatusStyles: Record<string, string> = {
  requested: "bg-blue-soft text-blue",
  active: "bg-mint-soft text-emerald-700",
  paused: "bg-coffee-soft text-coffee",
  cancelled: "bg-cream-dark text-ink-soft",
};
const checkoutStatusStyles: Record<string, string> = {
  open: "bg-blue-soft text-blue",
  paid: "bg-mint-soft text-emerald-700",
  expired: "bg-cream-dark text-ink-soft",
  cancelled: "bg-coffee-soft text-coffee",
};
const readinessStatusStyles: Record<string, string> = {
  pass: "bg-mint-soft text-emerald-700",
  warn: "bg-coffee-soft text-coffee",
  fail: "bg-red-50 text-red-700",
};
const outreachTypeStyles: Record<string, string> = {
  checkout: "bg-blue-soft text-blue",
  pilot_lead: "bg-mint-soft text-emerald-700",
  funding_request: "bg-coffee-soft text-coffee",
  standing_order: "bg-cream-dark text-ink-soft",
};
const closePlanStatusStyles: Record<string, string> = {
  target_met: "bg-mint-soft text-emerald-700",
  open_checkouts_can_close: "bg-blue-soft text-blue",
  pipeline_needed: "bg-coffee-soft text-coffee",
};

function pct(value: number, target: number): number {
  return target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  return new Date(`${key}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="font-mono text-xs font-semibold text-ink-soft">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-coffee">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{detail}</p>
    </div>
  );
}

export default async function RevenuePage() {
  const today = startOfUtcDay();
  const lastSevenStart = new Date(today.getTime() - 6 * DAY_MS);
  const now = new Date();
  const urlOptions = { origin: originFromHeaders(await headers()) };

  const [
    stripeCredits,
    agentOrders,
    recentStripeCredits,
    recentOrders,
    pilotLeads,
    fundingRequests,
    standingOrders,
    checkoutIntents,
    readiness,
    outreachQueue,
    closePlan,
  ] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: {
          type: "credit",
          source: "stripe_checkout",
          createdAt: { gte: lastSevenStart },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
      prisma.order.findMany({
        where: {
          status: "completed",
          createdAt: { gte: lastSevenStart },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        include: { items: true, agent: { select: { name: true } } },
      }),
      prisma.ledgerEntry.findMany({
        where: {
          type: "credit",
          source: "stripe_checkout",
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 8,
      }),
      prisma.order.findMany({
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true, agent: { select: { name: true } } },
      }),
      prisma.pilotLead.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 12,
      }),
      prisma.fundingRequest.findMany({
        where: { status: "open" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 8,
        include: { agent: { select: { name: true } } },
      }),
      prisma.standingOrder.findMany({
        where: { status: { in: ["requested", "active", "paused"] } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 12,
        include: { agent: { select: { name: true } } },
      }),
      prisma.checkoutIntent.findMany({
        where: { status: "open" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 12,
        include: {
          organization: {
            select: { name: true, billingEmail: true, source: true },
          },
        },
      }),
      getRevenueReadiness(urlOptions),
      getRevenueOutreachQueue(25, urlOptions),
      getRevenueClosePlan(urlOptions),
    ]);
  const salesKit = getRevenueSalesKit(urlOptions);

  const todayRevenueCents = stripeCredits
    .filter((entry) => entry.createdAt >= today)
    .reduce((sum, entry) => sum + entry.amountCents, 0);
  const todayAgentSpendCents = agentOrders
    .filter((order) => order.createdAt >= today)
    .reduce((sum, order) => sum + order.totalCents, 0);
  const sevenDayRevenueCents = stripeCredits.reduce(
    (sum, entry) => sum + entry.amountCents,
    0,
  );
  const sevenDayAgentSpendCents = agentOrders.reduce(
    (sum, order) => sum + order.totalCents,
    0,
  );
  const openPilotLeads = pilotLeads.filter((lead) =>
    openPilotStatuses.has(lead.status),
  );
  const openPilotPipelineCents = openPilotLeads.reduce(
    (sum, lead) => sum + lead.targetDailySpendCents,
    0,
  );
  const openFundingRequestCents = fundingRequests.reduce(
    (sum, request) => sum + request.shortfallCents,
    0,
  );
  const activeStandingDailyCents = standingOrders
    .filter((order) => order.status === "active")
    .reduce((sum, order) => sum + order.totalCents, 0);
  const requestedStandingDailyCents = standingOrders
    .filter((order) => order.status === "requested")
    .reduce((sum, order) => sum + order.totalCents, 0);
  const openCheckoutCents = checkoutIntents.reduce(
    (sum, intent) => sum + intent.amountCents,
    0,
  );
  const checkoutIntentsMissingRecovery = checkoutIntents.filter(
    (intent) => !intent.recoveryToken,
  ).length;
  const refreshableCheckoutIntents = checkoutIntents.filter(
    (intent) =>
      openCheckoutFollowupState(intent, now) === "refreshable_recovery",
  );
  const refreshableCheckoutCents = refreshableCheckoutIntents.reduce(
    (sum, intent) => sum + intent.amountCents,
    0,
  );

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(lastSevenStart.getTime() + i * DAY_MS);
    const key = dayKey(date);
    const cashRevenueCents = stripeCredits
      .filter((entry) => dayKey(entry.createdAt) === key)
      .reduce((sum, entry) => sum + entry.amountCents, 0);
    const agentSpendCents = agentOrders
      .filter((order) => dayKey(order.createdAt) === key)
      .reduce((sum, order) => sum + order.totalCents, 0);
    return { key, cashRevenueCents, agentSpendCents };
  });

  const daysAtTarget = days.filter(
    (day) => day.cashRevenueCents >= DAILY_TARGET_CENTS,
  ).length;
  const remainingTodayCents = Math.max(0, DAILY_TARGET_CENTS - todayRevenueCents);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-blue">
              TARGET · STRIPE WALLET FUNDING
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              {formatCents(DAILY_TARGET_CENTS)} per day
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              This page counts verified Stripe wallet credits across every
              organization as cash revenue. Agent purchases show product
              demand, but they spend prepaid credits and are tracked separately.
            </p>
          </div>
          <Link
            href="/api/agent-catalog"
            prefetch={false}
            className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
          >
            agent catalog JSON
          </Link>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-cream-dark">
          <div
            className="h-full rounded-full bg-mint"
            style={{ width: `${pct(todayRevenueCents, DAILY_TARGET_CENTS)}%` }}
          />
        </div>
        <p className="mt-3 font-mono text-sm text-ink-soft">
          {formatCents(todayRevenueCents)} booked today ·{" "}
          {formatCents(remainingTodayCents)} remaining
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-blue">
              TODAY CLOSE PLAN
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              {closePlan.summary}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Cash revenue is verified Stripe wallet funding since UTC
              midnight. Open and refreshable checkouts count only as pipeline
              until webhook or dashboard Stripe sync posts credits.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                closePlanStatusStyles[closePlan.status]
              }`}
            >
              {closePlan.status.replaceAll("_", " ")}
            </span>
            <Link
              href="/api/revenue/close-plan"
              prefetch={false}
              className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
            >
              close plan JSON
            </Link>
          </div>
        </div>
        {closePlan.buyer_link_readiness.status === "local_only" && (
          <div className="mt-6 rounded-xl border border-coffee/30 bg-coffee-soft p-4">
            <p className="font-mono text-xs font-semibold text-coffee">
              BUYER LINKS ARE LOCAL ONLY
            </p>
            <p className="mt-2 text-sm leading-relaxed text-coffee">
              Checkout and recovery links currently use{" "}
              <span className="font-mono">{closePlan.buyer_link_readiness.origin}</span>.
              {` ${closePlan.buyer_link_readiness.action}`}
            </p>
          </div>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-cream-dark p-4">
            <p className="font-mono text-xs font-semibold text-ink-soft">
              BOOKED TODAY
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-coffee">
              {formatCents(closePlan.cash_revenue_today_cents)}
            </p>
          </div>
          <div className="rounded-xl border border-cream-dark p-4">
            <p className="font-mono text-xs font-semibold text-ink-soft">
              REMAINING
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-coffee">
              {formatCents(closePlan.remaining_cents)}
            </p>
          </div>
          <div className="rounded-xl border border-cream-dark p-4">
            <p className="font-mono text-xs font-semibold text-ink-soft">
              OPEN CHECKOUTS
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-coffee">
              {formatCents(closePlan.open_checkout_cents)}
            </p>
          </div>
          <div className="rounded-xl border border-cream-dark p-4">
            <p className="font-mono text-xs font-semibold text-ink-soft">
              NEW PIPELINE NEEDED
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-coffee">
              {formatCents(closePlan.new_pipeline_needed.cents)}
            </p>
          </div>
        </div>
        {closePlan.parallel_close_actions.length > 0 && (
          <div className="mt-6 rounded-xl border border-cream-dark">
            <div className="border-b border-cream-dark px-4 py-3">
              <p className="font-mono text-xs font-semibold text-blue">
                PARALLEL CLOSE ACTIONS
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {closePlan.parallel_close_instruction}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                    <th className="px-4 py-3 font-medium">close action</th>
                    <th className="px-4 py-3 text-right font-medium">value</th>
                    <th className="px-4 py-3 text-right font-medium">link</th>
                  </tr>
                </thead>
                <tbody>
                  {closePlan.parallel_close_actions.map((action) => (
                    <tr key={action.id} className="border-b border-cream-dark/60">
                      <td className="px-4 py-3">
                        <span className="block font-medium">{action.label}</span>
                        <span className="font-mono text-[11px] text-ink-soft">
                          {action.next_action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {formatCents(action.amount_cents)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {action.mailto_url && (
                            <a
                              href={action.mailto_url}
                              className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                            >
                              email
                            </a>
                          )}
                          <a
                            href={action.url}
                            className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                          >
                            open
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-blue">
              SALES KIT
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">
              Shareable wallet offers for revenue outreach
            </h2>
          </div>
          <Link
            href="/api/revenue/sales-kit"
            prefetch={false}
            className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
          >
            sales kit JSON
          </Link>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                <th className="px-5 py-3 font-medium">offer</th>
                <th className="px-5 py-3 font-medium">angle</th>
                <th className="px-5 py-3 text-right font-medium">price</th>
                <th className="px-5 py-3 text-right font-medium">links</th>
              </tr>
            </thead>
            <tbody>
              {salesKit.offers.map((offer) => (
                <tr key={offer.bundle} className="border-b border-cream-dark/60">
                  <td className="px-5 py-3">
                    <span className="block font-medium">{offer.name}</span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      target {formatCents(offer.target_daily_spend_cents)} / day
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-soft">
                    {offer.angle}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-semibold">
                    {formatCents(offer.price_cents)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <a
                        href={offer.email.mailto_url}
                        className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                      >
                        email
                      </a>
                      <a
                        href={offer.offer_url}
                        className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                      >
                        offer
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-blue">
              GO-LIVE READINESS
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Revenue system is {readiness.status}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              These checks cover the pieces required to turn a buyer checkout
              into verified wallet credits and repeat agent spend.
            </p>
          </div>
          <Link
            href="/api/revenue/readiness"
            prefetch={false}
            className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
          >
            readiness JSON
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {readiness.checks.map((check) => (
            <div key={check.id} className="rounded-xl border border-cream-dark p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold">{check.label}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                    readinessStatusStyles[check.status]
                  }`}
                >
                  {check.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {check.detail}
              </p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-soft">
                {check.action}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="TODAY CASH REVENUE"
          value={formatCents(todayRevenueCents)}
          detail="Stripe-funded wallet credits booked since UTC midnight."
        />
        <StatCard
          label="TODAY AGENT SPEND"
          value={formatCents(todayAgentSpendCents)}
          detail="Completed agent purchases from prepaid credits."
        />
        <StatCard
          label="7-DAY CASH REVENUE"
          value={formatCents(sevenDayRevenueCents)}
          detail={`${daysAtTarget} of 7 days reached the cash revenue target.`}
        />
        <StatCard
          label="7-DAY AGENT SPEND"
          value={formatCents(sevenDayAgentSpendCents)}
          detail="Usage signal from agents spending existing credits."
        />
        <StatCard
          label="OPEN PILOT PIPELINE"
          value={formatCents(openPilotPipelineCents)}
          detail={`${openPilotLeads.length} active paid pilot request${openPilotLeads.length === 1 ? "" : "s"}.`}
        />
        <StatCard
          label="OPEN FUNDING REQUESTS"
          value={formatCents(openFundingRequestCents)}
          detail={`${fundingRequests.length} agent-created wallet funding request${fundingRequests.length === 1 ? "" : "s"}.`}
        />
        <StatCard
          label="ACTIVE STANDING ORDERS"
          value={formatCents(activeStandingDailyCents)}
          detail={`${formatCents(requestedStandingDailyCents)} per day awaiting human approval.`}
        />
        <StatCard
          label="OPEN CHECKOUTS"
          value={formatCents(openCheckoutCents)}
          detail={`${checkoutIntents.length} wallet checkout${checkoutIntents.length === 1 ? "" : "s"} waiting; ${refreshableCheckoutIntents.length} can refresh from recovery links.`}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-blue">
              REVENUE FOLLOW-UP QUEUE
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">
              {formatCents(outreachQueue.total_pipeline_cents)} queued across{" "}
              {outreachQueue.count} action
              {outreachQueue.count === 1 ? "" : "s"}
            </h2>
          </div>
          <Link
            href="/api/revenue/outreach"
            prefetch={false}
            className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
          >
            outreach JSON
          </Link>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {outreachQueue.items.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              No open checkout, pilot, funding, or standing-order follow-ups.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">recipient</th>
                  <th className="px-5 py-3 font-medium">opportunity</th>
                  <th className="px-5 py-3 text-right font-medium">value</th>
                  <th className="px-5 py-3 text-right font-medium">action</th>
                </tr>
              </thead>
              <tbody>
                {outreachQueue.items.map((item) => (
                  <tr key={item.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3">
                      <span className="block font-medium">
                        {item.organization_name}
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">
                        {item.recipient_email ?? "no email"} ·{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                            outreachTypeStyles[item.type] ?? "bg-cream-dark"
                          }`}
                        >
                          {item.type.replace("_", " ")}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{item.reason}</p>
                      <p className="mt-1 font-mono text-[11px] leading-relaxed text-ink-soft">
                        {item.next_action}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(item.amount_cents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.mailto_url && (
                          <a
                            href={item.mailto_url}
                            className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                          >
                            email
                          </a>
                        )}
                        <a
                          href={item.url}
                          className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                        >
                          open
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Checkout pipeline
            </h2>
            {checkoutIntentsMissingRecovery > 0 && (
              <p className="mt-1 text-sm text-ink-soft">
                {checkoutIntentsMissingRecovery} open checkout{" "}
                {checkoutIntentsMissingRecovery === 1 ? "needs" : "need"} a
                recovery link before follow-up.
              </p>
            )}
            {refreshableCheckoutIntents.length > 0 && (
              <p className="mt-1 text-sm text-ink-soft">
                {refreshableCheckoutIntents.length} recovery{" "}
                {refreshableCheckoutIntents.length === 1 ? "link" : "links"} can
                refresh {formatCents(refreshableCheckoutCents)} in stale checkout
                value.
              </p>
            )}
          </div>
          {checkoutIntentsMissingRecovery > 0 && (
            <form action={backfillCheckoutRecoveryLinks}>
              <button
                type="submit"
                className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
              >
                repair recovery links
              </button>
            </form>
          )}
          {checkoutIntents.length > 0 && (
            <form action={syncOpenCheckoutPayments}>
              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-2 font-mono text-xs font-semibold text-ink shadow-card hover:bg-cream-dark"
              >
                sync Stripe status
              </button>
            </form>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {checkoutIntents.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              No open Stripe Checkout sessions right now.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">buyer</th>
                  <th className="px-5 py-3 font-medium">bundle</th>
                  <th className="px-5 py-3 font-medium">status</th>
                  <th className="px-5 py-3 text-right font-medium">amount</th>
                  <th className="px-5 py-3 text-right font-medium">recovery</th>
                </tr>
              </thead>
              <tbody>
                {checkoutIntents.map((intent) => (
                  <tr key={intent.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3">
                      <span className="block font-medium">
                        {intent.organization.name}
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">
                        {intent.organization.billingEmail ?? "no email"} ·{" "}
                        {intent.createdAt.toLocaleString()}
                      </span>
                      <span className="block font-mono text-[11px] text-ink-soft">
                        followed up {intent.followupCount}×
                        {intent.lastFollowedUpAt
                          ? ` · ${intent.lastFollowedUpAt.toLocaleString()}`
                          : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="block font-mono text-xs">
                        {intent.bundleId}
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">
                        return {intent.returnPath}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                            checkoutStatusStyles[intent.status] ?? "bg-cream-dark"
                          }`}
                        >
                          {intent.status}
                        </span>
                        <span className="rounded-full bg-cream-dark px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
                          {openCheckoutFollowupState(intent, now) ===
                          "refreshable_recovery"
                            ? "refreshable"
                            : openCheckoutFollowupState(intent, now) ===
                                "missing_recovery"
                              ? "needs recovery"
                              : "live"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(intent.amountCents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {intent.recoveryToken ? (
                          <Link
                            href={`/checkout/${intent.recoveryToken}`}
                            className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                          >
                            {openCheckoutFollowupState(intent, now) ===
                            "refreshable_recovery"
                              ? "refresh page"
                              : "recovery page"}
                          </Link>
                        ) : (
                          <span className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] text-ink-soft">
                            no token
                          </span>
                        )}
                        {intent.checkoutUrl &&
                          checkoutHasUsableStripeSession(intent, now) && (
                          <a
                            href={intent.checkoutUrl}
                            className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                          >
                            stripe
                          </a>
                        )}
                        <form action={markCheckoutFollowedUp}>
                          <input
                            type="hidden"
                            name="checkoutIntentId"
                            value={intent.id}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                          >
                            followed up
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Last 7 UTC days
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                <th className="px-5 py-3 font-medium">day</th>
                <th className="px-5 py-3 text-right font-medium">cash revenue</th>
                <th className="px-5 py-3 text-right font-medium">agent spend</th>
                <th className="px-5 py-3 text-right font-medium">target</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.key} className="border-b border-cream-dark/60">
                  <td className="px-5 py-3 font-mono text-xs">
                    {dayLabel(day.key)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-semibold">
                    {formatCents(day.cashRevenueCents)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-ink-soft">
                    {formatCents(day.agentSpendCents)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono">
                    {day.cashRevenueCents >= DAILY_TARGET_CENTS ? "hit" : "gap"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Recent Stripe funding
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            {recentStripeCredits.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-soft">
                No verified Stripe wallet credits yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentStripeCredits.map((entry) => (
                    <tr key={entry.id} className="border-b border-cream-dark/60">
                      <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                        {entry.createdAt.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold">
                        {formatCents(entry.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Recent agent purchases
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            {recentOrders.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-soft">
                No completed agent purchases yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-cream-dark/60">
                      <td className="px-5 py-3">
                        <span className="block font-medium">
                          {order.items.map((item) => item.name).join(", ")}
                        </span>
                        <span className="font-mono text-[11px] text-ink-soft">
                          {order.agent.name} · {order.createdAt.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold">
                        {formatCents(order.totalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Agent standing orders
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {standingOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              No recurring agent purchase requests yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">order</th>
                  <th className="px-5 py-3 font-medium">status</th>
                  <th className="px-5 py-3 font-medium">agent</th>
                  <th className="px-5 py-3 text-right font-medium">daily</th>
                  <th className="px-5 py-3 text-right font-medium">controls</th>
                </tr>
              </thead>
              <tbody>
                {standingOrders.map((order) => (
                  <tr key={order.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/standing-orders/${order.id}`}
                        className="block font-medium underline-offset-4 hover:underline"
                      >
                        {order.productName}
                      </Link>
                      <span className="font-mono text-[11px] text-ink-soft">
                        {order.sku} · {order.cadence} ·{" "}
                        {order.lastRunStatus
                          ? `last ${order.lastRunStatus}`
                          : "not run"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                          standingOrderStatusStyles[order.status] ??
                          "bg-cream-dark"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {order.agent.name}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(order.totalCents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {(order.status === "requested" ||
                          order.status === "paused") && (
                          <form action={activateStandingOrder}>
                            <input
                              type="hidden"
                              name="standingOrderId"
                              value={order.id}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                            >
                              activate
                            </button>
                          </form>
                        )}
                        {order.status === "active" && (
                          <form action={pauseStandingOrder}>
                            <input
                              type="hidden"
                              name="standingOrderId"
                              value={order.id}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                            >
                              pause
                            </button>
                          </form>
                        )}
                        <form action={cancelStandingOrder}>
                          <input
                            type="hidden"
                            name="standingOrderId"
                            value={order.id}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                          >
                            cancel
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Agent funding requests
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {fundingRequests.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              No open agent-created funding requests yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">request</th>
                  <th className="px-5 py-3 font-medium">agent</th>
                  <th className="px-5 py-3 text-right font-medium">shortfall</th>
                  <th className="px-5 py-3 text-right font-medium">action</th>
                </tr>
              </thead>
              <tbody>
                {fundingRequests.map((request) => (
                  <tr key={request.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3">
                      <span className="block font-medium">
                        {request.productName}
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">
                        {request.sku} · {request.createdAt.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {request.agent.name}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(request.shortfallCents)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/funding-requests/${request.id}`}
                        className="font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                      >
                        open request
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Paid pilot pipeline
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {pilotLeads.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              No paid pilot requests yet. Send high-intent buyers to /pilot.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">organization</th>
                  <th className="px-5 py-3 font-medium">requested SKU</th>
                  <th className="px-5 py-3 font-medium">status</th>
                  <th className="px-5 py-3 text-right font-medium">target/day</th>
                  <th className="px-5 py-3 text-right font-medium">follow-up</th>
                </tr>
              </thead>
              <tbody>
                {pilotLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3">
                      <span className="block font-medium">
                        {lead.organizationName}
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">
                        {lead.email} · {lead.createdAt.toLocaleString()}
                      </span>
                      {lead.contactName && (
                        <span className="block font-mono text-[11px] text-ink-soft">
                          {lead.contactName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {lead.requestedSku}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                          pilotLeadStatusStyles[lead.status] ?? "bg-cream-dark"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(lead.targetDailySpendCents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {pilotLeadNextStatuses
                          .filter((status) => status !== lead.status)
                          .map((status) => (
                            <form key={status} action={updatePilotLeadStatus}>
                              <input
                                type="hidden"
                                name="leadId"
                                value={lead.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value={status}
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-cream-dark px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-soft hover:border-blue hover:text-blue"
                              >
                                {status}
                              </button>
                            </form>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
