import { randomBytes } from "crypto";
import { z } from "zod";
import { generateApiKey } from "./agent-auth";
import type { BundleId } from "./bundles";
import { getBundle } from "./bundles";
import {
  CheckoutSessionError,
  createWalletCheckoutSession,
} from "./checkout-sessions";
import { writeAuditLog } from "./credits";
import { prisma } from "./db";
import { DEFAULT_POLICY } from "./policy";
import type { UrlOptions } from "./site";

export const selfServeStartSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  website: z.string().trim().max(200).optional(),
  agentName: z.string().trim().min(2).max(80),
  targetDailySpendCents: z.coerce.number().int().min(100000).max(500000),
  initialBundle: z
    .enum(["thousand_day_wallet", "fleet_week_wallet", "market_maker_wallet"])
    .default("thousand_day_wallet"),
  workflow: z.string().trim().min(20).max(1200),
});

export interface SelfServeStartResult {
  organizationId: string;
  organizationName: string;
  billingEmail: string;
  agentId: string;
  agentName: string;
  rawKey: string;
  keyPrefix: string;
  targetDailySpendCents: number;
  checkoutBundleId: BundleId;
  checkoutAmountCents?: number;
  checkoutCreditsCents?: number;
  checkoutUrl?: string;
  checkoutRecoveryUrl?: string;
  checkoutIntentId?: string;
  checkoutError?: string;
}

function orgId(): string {
  return `org_${randomBytes(8).toString("hex")}`;
}

export async function createSelfServeStart(
  data: z.infer<typeof selfServeStartSchema>,
  options: UrlOptions = {},
): Promise<SelfServeStartResult> {
  const key = generateApiKey();
  const id = orgId();

  const created = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        id,
        name: data.organizationName,
        billingEmail: data.email,
        website: data.website || null,
        source: "self_serve",
        wallet: { create: { currency: "usd" } },
      },
    });

    const agent = await tx.agent.create({
      data: {
        organizationId: organization.id,
        name: data.agentName,
        status: "active",
        keyHash: key.keyHash,
        keyPrefix: key.keyPrefix,
        policy: {
          create: {
            ...DEFAULT_POLICY,
            dailyLimitCents: Math.max(
              DEFAULT_POLICY.dailyLimitCents,
              data.targetDailySpendCents,
            ),
            monthlyLimitCents: Math.max(
              DEFAULT_POLICY.monthlyLimitCents,
              data.targetDailySpendCents * 31,
            ),
            perPurchaseLimitCents: Math.max(
              DEFAULT_POLICY.perPurchaseLimitCents,
              100000,
            ),
            requireHumanApprovalOverCents: Math.max(
              DEFAULT_POLICY.requireHumanApprovalOverCents,
              100000,
            ),
          },
        },
      },
    });

    const lead = await tx.pilotLead.create({
      data: {
        organizationName: data.organizationName,
        email: data.email,
        website: data.website || null,
        useCase: data.workflow,
        targetDailySpendCents: data.targetDailySpendCents,
        requestedSku: "landing-page-copy-fixer",
        source: "self_serve_start",
        status: "contacted",
      },
    });

    await writeAuditLog(
      {
        organizationId: organization.id,
        actorType: "user",
        action: "self_serve_workspace.created",
        metadata: {
          agent_id: agent.id,
          key_prefix: key.keyPrefix,
          billing_email: data.email,
          target_daily_spend_cents: data.targetDailySpendCents,
          pilot_lead_id: lead.id,
        },
      },
      tx,
    );

    return { organization, agent };
  });

  const selectedBundle = getBundle(data.initialBundle);
  let checkout:
    | Awaited<ReturnType<typeof createWalletCheckoutSession>>
    | undefined;
  let checkoutError: string | undefined;

  try {
    checkout = await createWalletCheckoutSession({
      bundleId: data.initialBundle,
      organizationId: created.organization.id,
      returnPath: "/start",
      origin: options.origin,
    });
  } catch (e) {
    checkoutError =
      e instanceof CheckoutSessionError
        ? e.message
        : "Workspace created, but Stripe Checkout could not be started. Confirm STRIPE_SECRET_KEY is configured and use the funding buttons below.";
  }

  return {
    organizationId: created.organization.id,
    organizationName: created.organization.name,
    billingEmail: data.email,
    agentId: created.agent.id,
    agentName: created.agent.name,
    rawKey: key.rawKey,
    keyPrefix: key.keyPrefix,
    targetDailySpendCents: data.targetDailySpendCents,
    checkoutBundleId: data.initialBundle,
    checkoutAmountCents: selectedBundle?.priceCents,
    checkoutCreditsCents: selectedBundle?.creditsCents,
    checkoutUrl: checkout?.url,
    checkoutRecoveryUrl: checkout?.recovery_url,
    checkoutIntentId: checkout?.checkout_intent_id,
    checkoutError,
  };
}
