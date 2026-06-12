import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import type { BundleId } from "./bundles";
import { getBundle } from "./bundles";
import { writeAuditLog } from "./credits";
import { prisma } from "./db";
import { absoluteUrl, type UrlOptions } from "./site";
import { getStripe } from "./stripe";

export type CheckoutReturnPath =
  | "/dashboard/billing"
  | "/pilot"
  | "/funding-request"
  | "/standing-order"
  | "/start";

export class CheckoutSessionError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "CheckoutSessionError";
    this.code = code;
    this.status = status;
  }
}

export interface CreateWalletCheckoutInput extends UrlOptions {
  bundleId: BundleId;
  organizationId: string;
  returnPath: CheckoutReturnPath;
  fundingRequestId?: string;
  standingOrderId?: string;
}

export interface CreateReplacementCheckoutInput extends UrlOptions {
  recoveryToken: string;
}

const MAX_OPEN_CHECKOUT_INTENTS = 10;

function recoveryToken(): string {
  return randomBytes(16).toString("hex");
}

async function assignRecoveryToken(checkoutIntentId: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.checkoutIntent.update({
        where: { id: checkoutIntentId },
        data: { recoveryToken: recoveryToken() },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        continue;
      }
      throw e;
    }
  }

  throw new CheckoutSessionError(
    "internal_error",
    "Could not create a unique checkout recovery token.",
    500,
  );
}

export async function backfillCheckoutRecoveryTokens(limit = 100) {
  const intents = await prisma.checkoutIntent.findMany({
    where: { status: "open", recoveryToken: null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  const repaired = [];
  for (const intent of intents) {
    const updated = await assignRecoveryToken(intent.id);
    if (!updated.recoveryToken) {
      throw new CheckoutSessionError(
        "internal_error",
        "Checkout recovery token was not stored.",
        500,
      );
    }
    const recoveryUrl = absoluteUrl(`/checkout/${updated.recoveryToken}`);

    await writeAuditLog({
      organizationId: intent.organizationId,
      actorType: "user",
      action: "checkout_intent.recovery_token_backfilled",
      metadata: {
        checkout_intent_id: intent.id,
        stripe_session_id: intent.stripeSessionId,
        bundle: intent.bundleId,
        amount_cents: intent.amountCents,
        recovery_url: recoveryUrl,
      },
    });

    repaired.push({
      checkout_intent_id: updated.id,
      recovery_token: updated.recoveryToken,
      recovery_url: recoveryUrl,
    });
  }

  return {
    repaired_count: repaired.length,
    repaired,
  };
}

function resolvedReturnPath(input: CreateWalletCheckoutInput): string {
  if (input.returnPath === "/funding-request") {
    if (!input.fundingRequestId) {
      throw new CheckoutSessionError(
        "invalid_request",
        "funding_request_id is required when return_path is /funding-request.",
      );
    }
    return `/funding-requests/${input.fundingRequestId}`;
  }

  if (input.returnPath === "/standing-order") {
    if (!input.standingOrderId) {
      throw new CheckoutSessionError(
        "invalid_request",
        "standing_order_id is required when return_path is /standing-order.",
      );
    }
    return `/standing-orders/${input.standingOrderId}`;
  }

  return input.returnPath;
}

function returnPathForReplacement(intent: {
  returnPath: string;
  fundingRequestId: string | null;
  standingOrderId: string | null;
}): Pick<
  CreateWalletCheckoutInput,
  "returnPath" | "fundingRequestId" | "standingOrderId"
> {
  if (intent.fundingRequestId) {
    return {
      returnPath: "/funding-request",
      fundingRequestId: intent.fundingRequestId,
    };
  }

  if (intent.standingOrderId) {
    return {
      returnPath: "/standing-order",
      standingOrderId: intent.standingOrderId,
    };
  }

  if (
    intent.returnPath === "/dashboard/billing" ||
    intent.returnPath === "/pilot" ||
    intent.returnPath === "/start"
  ) {
    return { returnPath: intent.returnPath };
  }

  return { returnPath: "/start" };
}

export async function createWalletCheckoutSession(input: CreateWalletCheckoutInput) {
  const bundle = getBundle(input.bundleId);
  if (!bundle) {
    throw new CheckoutSessionError("invalid_request", "Unknown credit bundle.");
  }

  const returnPath = resolvedReturnPath(input);
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
  });
  if (!org) {
    throw new CheckoutSessionError("invalid_request", "Unknown organization.", 403);
  }

  // Each call opens a real Stripe Checkout session, so bound how many can sit
  // open per org — abandoned ones expire on their own, paid/expired don't count.
  const openIntents = await prisma.checkoutIntent.count({
    where: { organizationId: org.id, status: "open" },
  });
  if (openIntents >= MAX_OPEN_CHECKOUT_INTENTS) {
    throw new CheckoutSessionError(
      "too_many_open_checkouts",
      "This organization already has several unpaid checkouts open. Finish or let one expire, or use its recovery link.",
      429,
    );
  }

  if (input.fundingRequestId) {
    const fundingRequest = await prisma.fundingRequest.findFirst({
      where: {
        id: input.fundingRequestId,
        organizationId: org.id,
      },
    });
    if (!fundingRequest) {
      throw new CheckoutSessionError("invalid_request", "Unknown funding request.", 403);
    }
  }

  if (input.standingOrderId) {
    const standingOrder = await prisma.standingOrder.findFirst({
      where: {
        id: input.standingOrderId,
        organizationId: org.id,
      },
    });
    if (!standingOrder) {
      throw new CheckoutSessionError("invalid_request", "Unknown standing order.", 403);
    }
  }

  const stripe = getStripe();
  const appUrl = new URL(absoluteUrl("/", input)).origin;
  let stripeCustomerId = org.stripeCustomerId;

  if (!stripeCustomerId && org.billingEmail) {
    const customer = await stripe.customers.create({
      email: org.billingEmail,
      name: org.name,
      metadata: { organization_id: org.id },
    });
    stripeCustomerId = customer.id;
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: bundle.priceCents,
          product_data: {
            name: `Agent Credits - ${bundle.name}`,
            description: bundle.blurb,
          },
        },
      },
    ],
    metadata: {
      organization_id: org.id,
      credits_cents: String(bundle.creditsCents),
      bundle: bundle.id,
      ...(input.fundingRequestId
        ? { funding_request_id: input.fundingRequestId }
        : {}),
      ...(input.standingOrderId
        ? { standing_order_id: input.standingOrderId }
        : {}),
    },
    client_reference_id: org.id,
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : org.billingEmail
        ? { customer_email: org.billingEmail }
        : {}),
    success_url: `${appUrl}${returnPath}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${returnPath}?purchase=cancelled`,
  });

  if (!session.url) {
    throw new CheckoutSessionError(
      "internal_error",
      "Stripe did not return a checkout URL.",
      500,
    );
  }

  const token = recoveryToken();
  const checkoutIntent = await prisma.checkoutIntent.create({
    data: {
      organizationId: org.id,
      bundleId: bundle.id,
      amountCents: bundle.priceCents,
      creditsCents: bundle.creditsCents,
      status: "open",
      stripeSessionId: session.id,
      stripeCustomerId,
      checkoutUrl: session.url,
      recoveryToken: token,
      returnPath,
      fundingRequestId: input.fundingRequestId,
      standingOrderId: input.standingOrderId,
      ...(session.expires_at
        ? { expiresAt: new Date(session.expires_at * 1000) }
        : {}),
    },
  });

  const recoveryUrl = absoluteUrl(`/checkout/${token}`, input);
  await writeAuditLog({
    organizationId: org.id,
    actorType: "user",
    action: "billing.checkout_session_created",
    metadata: {
      bundle: bundle.id,
      price_cents: bundle.priceCents,
      session_id: session.id,
      checkout_intent_id: checkoutIntent.id,
      recovery_url: recoveryUrl,
      stripe_customer_id: stripeCustomerId,
      funding_request_id: input.fundingRequestId,
      standing_order_id: input.standingOrderId,
      return_path: returnPath,
    },
  });

  return {
    url: session.url,
    checkout_intent_id: checkoutIntent.id,
    stripe_session_id: session.id,
    recovery_url: recoveryUrl,
  };
}

export async function createReplacementCheckoutSession(
  input: CreateReplacementCheckoutInput,
) {
  const intent = await prisma.checkoutIntent.findUnique({
    where: { recoveryToken: input.recoveryToken },
  });

  if (!intent) {
    throw new CheckoutSessionError(
      "invalid_request",
      "Unknown checkout recovery link.",
      404,
    );
  }

  if (intent.status === "paid") {
    throw new CheckoutSessionError(
      "invalid_request",
      "This wallet checkout has already been paid.",
      409,
    );
  }

  const now = new Date();
  if (
    intent.status === "open" &&
    intent.checkoutUrl &&
    (!intent.expiresAt || intent.expiresAt > now)
  ) {
    return {
      url: intent.checkoutUrl,
      checkout_intent_id: intent.id,
      stripe_session_id: intent.stripeSessionId,
      recovery_url: absoluteUrl(`/checkout/${input.recoveryToken}`, input),
      reused_existing: true,
    };
  }

  const replacement = await createWalletCheckoutSession({
    bundleId: intent.bundleId as BundleId,
    organizationId: intent.organizationId,
    origin: input.origin,
    ...returnPathForReplacement(intent),
  });

  await prisma.checkoutIntent.updateMany({
    where: { id: intent.id, status: "open" },
    data: { status: "expired" },
  });

  await writeAuditLog({
    organizationId: intent.organizationId,
    actorType: "user",
    action: "checkout_intent.replaced",
    metadata: {
      previous_checkout_intent_id: intent.id,
      previous_stripe_session_id: intent.stripeSessionId,
      replacement_checkout_intent_id: replacement.checkout_intent_id,
      replacement_stripe_session_id: replacement.stripe_session_id,
      replacement_recovery_url: replacement.recovery_url,
    },
  });

  return {
    ...replacement,
    reused_existing: false,
  };
}
