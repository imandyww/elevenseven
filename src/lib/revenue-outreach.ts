import { getBundle } from "./bundles";
import {
  openCheckoutFollowupState,
  type OpenCheckoutFollowupState,
} from "./checkout-recovery";
import { prisma } from "./db";
import { formatCents } from "./money";
import { revenueOfferForTargetCents } from "./revenue-offers";
import { absoluteUrl, type UrlOptions } from "./site";
import { prefilledStartUrl } from "./start-prefill";

const TARGET_DAILY_REVENUE_CENTS = 100000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type RevenueOutreachType =
  | "checkout"
  | "pilot_lead"
  | "funding_request"
  | "standing_order";

export interface RevenueOutreachItem {
  id: string;
  type: RevenueOutreachType;
  priority: number;
  label: string;
  organization_name: string;
  recipient_email: string | null;
  amount_cents: number;
  url: string;
  mailto_url: string | null;
  subject: string;
  body: string;
  next_action: string;
  reason: string;
  created_at: string;
  checkout_state?: OpenCheckoutFollowupState;
}

function ageDays(createdAt: Date): number {
  return Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / DAY_MS));
}

function mailtoUrl(email: string | null, subject: string, body: string) {
  if (!email) return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

function priority(amountCents: number, createdAt: Date, bonus = 0): number {
  return amountCents + ageDays(createdAt) * 10000 + bonus;
}

export async function getRevenueOutreachQueue(
  limit = 25,
  options: UrlOptions = {},
) {
  const now = new Date();
  const [checkoutIntents, pilotLeads, fundingRequests, standingOrders] =
    await Promise.all([
      prisma.checkoutIntent.findMany({
        where: { status: "open" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        include: {
          organization: {
            select: { name: true, billingEmail: true, source: true },
          },
        },
      }),
      prisma.pilotLead.findMany({
        where: { status: { in: ["new", "contacted"] } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
      }),
      prisma.fundingRequest.findMany({
        where: { status: "open" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        include: {
          agent: { select: { name: true } },
          organization: { select: { name: true, billingEmail: true } },
        },
      }),
      prisma.standingOrder.findMany({
        where: { status: "requested" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        include: {
          agent: { select: { name: true } },
          organization: { select: { name: true, billingEmail: true } },
        },
      }),
    ]);

  const checkoutItems: RevenueOutreachItem[] = checkoutIntents.map((intent) => {
    const bundle = getBundle(intent.bundleId);
    const checkoutState = openCheckoutFollowupState(intent, now);
    const isRefreshable = checkoutState === "refreshable_recovery";
    const isMissingRecovery = checkoutState === "missing_recovery";
    const url = intent.recoveryToken
      ? absoluteUrl(`/checkout/${intent.recoveryToken}`, options)
      : intent.checkoutUrl ?? absoluteUrl(intent.returnPath, options);
    const bundleName = bundle?.name ?? intent.bundleId;
    const followupPenalty = intent.followupCount * 15000;
    const subject = isRefreshable
      ? `Refresh and fund ${bundleName}`
      : `Finish funding ${bundleName}`;
    const body = [
      `Hi ${intent.organization.name},`,
      "",
      isRefreshable
        ? `Your previous ${bundleName} Stripe session may have expired, but the same ${formatCents(
            intent.amountCents,
          )} buyer wallet funding can be reopened here:`
        : `Your ${bundleName} checkout for ${formatCents(
            intent.amountCents,
          )} in Agent Credits is ready here:`,
      url,
      "",
      isRefreshable
        ? "That recovery page creates a fresh Stripe Checkout if needed. Once server-side Stripe reconciliation confirms payment, the wallet is credited automatically."
        : "Once server-side Stripe reconciliation confirms payment, the wallet is credited automatically and agents can keep buying from the catalog.",
    ].join("\n");

    return {
      id: `checkout:${intent.id}`,
      type: "checkout",
      priority:
        priority(
          intent.amountCents,
          intent.createdAt,
          intent.amountCents >= TARGET_DAILY_REVENUE_CENTS ? 50000 : 25000,
        ) - followupPenalty,
      label: isRefreshable
        ? `${bundleName} refreshable checkout`
        : `${bundleName} checkout`,
      organization_name: intent.organization.name,
      recipient_email: intent.organization.billingEmail,
      amount_cents: intent.amountCents,
      url,
      mailto_url: mailtoUrl(intent.organization.billingEmail, subject, body),
      subject,
      body,
      next_action: isRefreshable
        ? "Email the recovery link; it will create a fresh Stripe checkout for the same wallet if the old session expired."
        : isMissingRecovery
          ? "Repair checkout recovery links or send the direct Stripe link, then mark the checkout followed up."
          : "Email the buyer the recovery checkout link, then mark the checkout followed up in the dashboard.",
      reason: isRefreshable
        ? `${formatCents(
            intent.amountCents,
          )} in refreshable wallet checkout value is waiting on buyer completion.`
        : `${formatCents(
            intent.amountCents,
          )} in open Stripe checkout value is waiting on buyer completion.`,
      created_at: intent.createdAt.toISOString(),
      checkout_state: checkoutState,
    };
  });

  const pilotItems: RevenueOutreachItem[] = pilotLeads.map((lead) => {
    const offer = revenueOfferForTargetCents(
      lead.targetDailySpendCents,
      options,
    );
    const url = prefilledStartUrl(offer.url, {
      organizationName: lead.organizationName,
      email: lead.email,
      website: lead.website ?? undefined,
      agentName: "revenue-agent",
      workflow: lead.useCase,
    }, options);
    const subject = `Start your ${formatCents(
      offer.targetDailySpendCents,
    )}/day agent wallet`;
    const greeting = lead.contactName ?? lead.organizationName;
    const body = [
      `Hi ${greeting},`,
      "",
      `Your paid-pilot request for ${lead.requestedSku} targets ${formatCents(
        lead.targetDailySpendCents,
      )}/day in agent spend.`,
      `I prepared the ${offer.bundle.name} checkout-ready form here: ${url}`,
      "",
      "One submit creates the buyer wallet, first agent key, and Stripe checkout. After server-side Stripe reconciliation confirms payment, the agent can buy from the catalog inside policy limits.",
    ].join("\n");

    return {
      id: `pilot_lead:${lead.id}`,
      type: "pilot_lead",
      priority: priority(
        offer.bundle.priceCents,
        lead.createdAt,
        lead.status === "new" ? 40000 : 20000,
      ),
      label: `${offer.bundle.name} paid pilot`,
      organization_name: lead.organizationName,
      recipient_email: lead.email,
      amount_cents: offer.bundle.priceCents,
      url,
      mailto_url: mailtoUrl(lead.email, subject, body),
      subject,
      body,
      next_action: "Reply with the Start link and move the lead to contacted or won.",
      reason: `${lead.status} paid-pilot lead with a ${formatCents(
        lead.targetDailySpendCents,
      )}/day target.`,
      created_at: lead.createdAt.toISOString(),
    };
  });

  const fundingItems: RevenueOutreachItem[] = fundingRequests.map((request) => {
    const url = absoluteUrl(`/funding-requests/${request.id}`, options);
    const subject = `Fund ${request.productName} for ${request.agent.name}`;
    const body = [
      `Hi ${request.organization.name},`,
      "",
      `${request.agent.name} requested ${request.quantity} x ${request.productName}.`,
      `The wallet needs ${formatCents(
        request.shortfallCents,
      )} more before the purchase can complete.`,
      `Approve and fund it here: ${url}`,
    ].join("\n");

    return {
      id: `funding_request:${request.id}`,
      type: "funding_request",
      priority: priority(request.shortfallCents, request.createdAt, 30000),
      label: `${request.productName} funding request`,
      organization_name: request.organization.name,
      recipient_email: request.organization.billingEmail,
      amount_cents: request.shortfallCents,
      url,
      mailto_url: mailtoUrl(request.organization.billingEmail, subject, body),
      subject,
      body,
      next_action: "Send the funding page to the wallet owner so the agent purchase can complete.",
      reason: `${request.agent.name} is blocked on ${formatCents(
        request.shortfallCents,
      )} of wallet funding.`,
      created_at: request.createdAt.toISOString(),
    };
  });

  const standingOrderItems: RevenueOutreachItem[] = standingOrders.map((order) => {
    const url = absoluteUrl(`/standing-orders/${order.id}`, options);
    const subject = `Approve daily ${order.productName} standing order`;
    const body = [
      `Hi ${order.organization.name},`,
      "",
      `${order.agent.name} requested a daily standing order for ${order.quantity} x ${order.productName}.`,
      `That authorizes ${formatCents(order.totalCents)} of recurring daily agent spend.`,
      `Review and activate it here: ${url}`,
    ].join("\n");

    return {
      id: `standing_order:${order.id}`,
      type: "standing_order",
      priority: priority(order.totalCents * 7, order.createdAt, 35000),
      label: `${order.productName} standing order`,
      organization_name: order.organization.name,
      recipient_email: order.organization.billingEmail,
      amount_cents: order.totalCents,
      url,
      mailto_url: mailtoUrl(order.organization.billingEmail, subject, body),
      subject,
      body,
      next_action: "Review the standing order and activate it if the daily spend envelope is approved.",
      reason: `${formatCents(
        order.totalCents,
      )}/day requested recurring agent spend is awaiting approval.`,
      created_at: order.createdAt.toISOString(),
    };
  });

  const items = [
    ...checkoutItems,
    ...pilotItems,
    ...fundingItems,
    ...standingOrderItems,
  ]
    .sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at))
    .slice(0, limit);

  return {
    generated_at: new Date().toISOString(),
    target_daily_revenue_cents: TARGET_DAILY_REVENUE_CENTS,
    total_pipeline_cents: items.reduce((sum, item) => sum + item.amount_cents, 0),
    count: items.length,
    items,
  };
}
