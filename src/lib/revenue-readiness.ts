import { prisma } from "./db";
import { products } from "./products";
import { absoluteUrl, isLocalOrigin, type UrlOptions } from "./site";

export type ReadinessStatus = "pass" | "warn" | "fail";

export interface ReadinessCheck {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  action: string;
}

const TARGET_DAILY_REVENUE_CENTS = 100000;

function statusRank(status: ReadinessStatus): number {
  return status === "fail" ? 2 : status === "warn" ? 1 : 0;
}

function overallStatus(checks: ReadinessCheck[]): ReadinessStatus {
  return checks.map((check) => check.status).sort((a, b) => statusRank(b) - statusRank(a))[0] ?? "pass";
}

export async function getRevenueReadiness(options: UrlOptions = {}) {
  const [
    openCheckoutStats,
    openCheckoutsMissingRecovery,
    completedStripeEvent,
    paidCheckoutIntent,
    stripeCredit,
    selfServeOrgCount,
    activeStandingOrderCount,
  ] = await Promise.all([
    prisma.checkoutIntent.aggregate({
      where: { status: "open" },
      _count: { id: true },
      _sum: { amountCents: true },
    }),
    prisma.checkoutIntent.count({
      where: { status: "open", recoveryToken: null },
    }),
    prisma.stripeEvent.findFirst({
      where: { type: "checkout.session.completed" },
      orderBy: { processedAt: "desc" },
      select: { processedAt: true },
    }),
    prisma.checkoutIntent.findFirst({
      where: { status: "paid" },
      orderBy: { paidAt: "desc" },
      select: { paidAt: true },
    }),
    prisma.ledgerEntry.findFirst({
      where: { type: "credit", source: "stripe_checkout" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.organization.count({ where: { source: "self_serve" } }),
    prisma.standingOrder.count({ where: { status: "active" } }),
  ]);

  const openCheckoutCount = openCheckoutStats._count.id;
  const openCheckoutCents = openCheckoutStats._sum.amountCents ?? 0;
  const hasStarterCatalog = products.some(
    (product) => product.sku === "landing-page-copy-fixer",
  );
  const webhookEvidenceAt =
    completedStripeEvent?.processedAt ??
    paidCheckoutIntent?.paidAt ??
    stripeCredit?.createdAt ??
    null;
  const appUrlOrigin = new URL(absoluteUrl("/", options)).origin;

  const checks: ReadinessCheck[] = [
    {
      id: "stripe_secret",
      label: "Stripe checkout secret",
      status: process.env.STRIPE_SECRET_KEY ? "pass" : "fail",
      detail: process.env.STRIPE_SECRET_KEY
        ? "Checkout creation can initialize the Stripe server client."
        : "Wallet checkout cannot open without a Stripe secret key.",
      action: "Set STRIPE_SECRET_KEY in the deployment environment.",
    },
    {
      id: "stripe_webhook_secret",
      label: "Stripe webhook secret",
      status: process.env.STRIPE_WEBHOOK_SECRET ? "pass" : "fail",
      detail: process.env.STRIPE_WEBHOOK_SECRET
        ? "Webhook signatures can be verified before wallet credits post."
        : "Paid checkout sessions cannot safely credit wallets until webhook verification is configured.",
      action: "Set STRIPE_WEBHOOK_SECRET and point Stripe checkout.session.completed events at /api/webhooks/stripe.",
    },
    {
      id: "public_app_url",
      label: "Public app URL",
      status: isLocalOrigin(appUrlOrigin) ? "warn" : "pass",
      detail: `Checkout return URLs use ${appUrlOrigin}.`,
      action:
        "Call buyer-facing APIs from the public origin or set NEXT_PUBLIC_APP_URL to the public production origin before sending buyers.",
    },
    {
      id: "webhook_reconciliation",
      label: "Webhook reconciliation observed",
      status: webhookEvidenceAt ? "pass" : "warn",
      detail: webhookEvidenceAt
        ? `Latest verified Stripe reconciliation evidence: ${webhookEvidenceAt.toISOString()}.`
        : "No completed Stripe checkout has been reconciled into wallet credits yet.",
      action: "Run a Stripe test-mode checkout, then use the Revenue dashboard Stripe sync if the webhook is delayed.",
    },
    {
      id: "checkout_recovery",
      label: "Checkout recovery links",
      status:
        openCheckoutsMissingRecovery === 0
          ? "pass"
          : openCheckoutsMissingRecovery === openCheckoutCount
            ? "fail"
            : "warn",
      detail:
        openCheckoutsMissingRecovery === 0
          ? "Every open checkout has a recovery page that can refresh expired Stripe sessions."
          : `${openCheckoutsMissingRecovery} open checkout session${openCheckoutsMissingRecovery === 1 ? "" : "s"} lack recovery tokens.`,
      action: "Use the Revenue dashboard repair button, then send recovery links before follow-up.",
    },
    {
      id: "open_checkout_pipeline",
      label: "Open checkout pipeline",
      status:
        openCheckoutCents >= TARGET_DAILY_REVENUE_CENTS
          ? "pass"
          : openCheckoutCount > 0
            ? "warn"
            : "warn",
      detail:
        openCheckoutCount > 0
          ? `${openCheckoutCount} open checkout session${openCheckoutCount === 1 ? "" : "s"} totaling ${openCheckoutCents} cents.`
          : "No buyer checkout sessions are currently waiting for payment.",
      action: "Send buyers to /start or recovery links; recovery pages can refresh stale checkout sessions.",
    },
    {
      id: "self_serve_workspace",
      label: "Self-serve buyer workspace",
      status: selfServeOrgCount > 0 ? "pass" : "warn",
      detail:
        selfServeOrgCount > 0
          ? `${selfServeOrgCount} self-serve buyer organization${selfServeOrgCount === 1 ? "" : "s"} exist.`
          : "No self-serve buyer organization has been created yet.",
      action: "Use /start to create a buyer workspace, API key, and wallet before outreach.",
    },
    {
      id: "recurring_purchase_path",
      label: "Recurring purchase path",
      status: activeStandingOrderCount > 0 ? "pass" : "warn",
      detail:
        activeStandingOrderCount > 0
          ? `${activeStandingOrderCount} active standing order${activeStandingOrderCount === 1 ? "" : "s"} can run daily.`
          : "No active standing orders are ready to convert funded wallets into repeat agent purchases.",
      action: "Have agents request /v1/standing-orders and activate qualified requests.",
    },
    {
      id: "starter_catalog_sku",
      label: "Starter catalog SKU",
      status: hasStarterCatalog ? "pass" : "fail",
      detail: hasStarterCatalog
        ? "The catalog includes landing-page-copy-fixer."
        : "The catalog is missing the starter storefront SKU.",
      action: "Restore the landing-page-copy-fixer product before publishing the storefront.",
    },
  ];

  return {
    generated_at: new Date().toISOString(),
    target_daily_revenue_cents: TARGET_DAILY_REVENUE_CENTS,
    status: overallStatus(checks),
    open_checkout_count: openCheckoutCount,
    open_checkout_cents: openCheckoutCents,
    checks,
  };
}
