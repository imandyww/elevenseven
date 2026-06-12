"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateApiKey } from "@/lib/agent-auth";
import { backfillCheckoutRecoveryTokens } from "@/lib/checkout-sessions";
import { prisma } from "@/lib/db";
import { requireOperator } from "@/lib/operator-auth";
import { DEMO_ORG_ID } from "@/lib/org";
import { writeAuditLog } from "@/lib/credits";
import { DEFAULT_POLICY } from "@/lib/policy";
import {
  activateStandingOrder as approveStandingOrder,
  setStandingOrderStatus,
} from "@/lib/standing-orders";
import { syncOpenCheckoutIntentsWithStripe } from "@/lib/stripe-checkout-reconciliation";

// Human-only mutations, reachable solely through dashboard forms — there is
// deliberately no agent-facing route to any of these (agents must never be
// able to edit their own spending policy).

const policySchema = z.object({
  agentId: z.string().min(1),
  dailyLimitCents: z.coerce.number().int().min(0).max(1_000_000),
  monthlyLimitCents: z.coerce.number().int().min(0).max(10_000_000),
  perPurchaseLimitCents: z.coerce.number().int().min(0).max(1_000_000),
  requireHumanApprovalOverCents: z.coerce.number().int().min(0).max(10_000_000),
  blockedSkus: z.string().default(""),
  allowedCategories: z.string().default(""),
});

const createAgentSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

const pilotLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(["new", "contacted", "won", "lost"]),
});

const standingOrderActionSchema = z.object({
  standingOrderId: z.string().min(1),
});

const checkoutIntentActionSchema = z.object({
  checkoutIntentId: z.string().min(1),
});

export interface CreateAgentState {
  ok: boolean;
  message: string;
  rawKey?: string;
  agentId?: string;
  keyPrefix?: string;
}

function csvToJsonArray(csv: string): string {
  const items = csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}

export async function updatePolicy(formData: FormData) {
  await requireOperator();
  const parsed = policySchema.parse(Object.fromEntries(formData.entries()));

  const agent = await prisma.agent.findUnique({ where: { id: parsed.agentId } });
  if (!agent) throw new Error("Unknown agent.");

  await prisma.agentPolicy.update({
    where: { agentId: agent.id },
    data: {
      dailyLimitCents: parsed.dailyLimitCents,
      monthlyLimitCents: parsed.monthlyLimitCents,
      perPurchaseLimitCents: parsed.perPurchaseLimitCents,
      requireHumanApprovalOverCents: parsed.requireHumanApprovalOverCents,
      blockedSkusJson: csvToJsonArray(parsed.blockedSkus),
      allowedCategoriesJson: csvToJsonArray(parsed.allowedCategories),
    },
  });

  await writeAuditLog({
    organizationId: agent.organizationId,
    actorType: "user",
    action: "policy.updated",
    metadata: {
      agent_id: agent.id,
      daily_limit_cents: parsed.dailyLimitCents,
      monthly_limit_cents: parsed.monthlyLimitCents,
      per_purchase_limit_cents: parsed.perPurchaseLimitCents,
      require_human_approval_over_cents: parsed.requireHumanApprovalOverCents,
      blocked_skus: JSON.parse(csvToJsonArray(parsed.blockedSkus)),
      allowed_categories: JSON.parse(csvToJsonArray(parsed.allowedCategories)),
    },
  });

  revalidatePath(`/dashboard/agents/${agent.id}/spending`);
}

export async function createAgent(
  _prevState: CreateAgentState,
  formData: FormData,
): Promise<CreateAgentState> {
  await requireOperator();
  const parsed = createAgentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Agent name must be 2-80 characters.",
    };
  }

  const org = await prisma.organization.findUnique({ where: { id: DEMO_ORG_ID } });
  if (!org) {
    return {
      ok: false,
      message: "Demo organization is missing. Run npm run db:seed first.",
    };
  }

  const key = generateApiKey();
  const agent = await prisma.agent.create({
    data: {
      organizationId: org.id,
      name: parsed.data.name,
      status: "active",
      keyHash: key.keyHash,
      keyPrefix: key.keyPrefix,
      policy: { create: DEFAULT_POLICY },
    },
  });

  await writeAuditLog({
    organizationId: org.id,
    actorType: "user",
    action: "agent.created",
    metadata: {
      agent_id: agent.id,
      name: agent.name,
      key_prefix: key.keyPrefix,
      source: "dashboard",
    },
  });

  revalidatePath("/dashboard/agents");
  revalidatePath("/dashboard/revenue");

  return {
    ok: true,
    message: `Created ${agent.name}. Store this API key now; it will not be shown again.`,
    rawKey: key.rawKey,
    agentId: agent.id,
    keyPrefix: key.keyPrefix,
  };
}

async function setAgentStatus(agentId: string, status: "active" | "paused" | "revoked") {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new Error("Unknown agent.");
  if (agent.status === "revoked" && status !== "revoked") {
    throw new Error("Revoked agents cannot be reactivated; create a new key.");
  }

  await prisma.agent.update({ where: { id: agentId }, data: { status } });
  await writeAuditLog({
    organizationId: agent.organizationId,
    actorType: "user",
    action: `agent.${status === "active" ? "resumed" : status}`,
    metadata: { agent_id: agentId, previous_status: agent.status },
  });

  revalidatePath(`/dashboard/agents/${agentId}/spending`);
  revalidatePath("/dashboard/agents");
}

export async function pauseAgent(formData: FormData) {
  await requireOperator();
  await setAgentStatus(String(formData.get("agentId")), "paused");
}

export async function resumeAgent(formData: FormData) {
  await requireOperator();
  await setAgentStatus(String(formData.get("agentId")), "active");
}

export async function revokeAgent(formData: FormData) {
  await requireOperator();
  await setAgentStatus(String(formData.get("agentId")), "revoked");
}

export async function updatePilotLeadStatus(formData: FormData) {
  await requireOperator();
  const parsed = pilotLeadStatusSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  const lead = await prisma.pilotLead.findUnique({
    where: { id: parsed.leadId },
  });
  if (!lead) throw new Error("Unknown pilot lead.");

  await prisma.pilotLead.update({
    where: { id: lead.id },
    data: { status: parsed.status },
  });

  await writeAuditLog({
    actorType: "user",
    action: "pilot_lead.status_updated",
    metadata: {
      lead_id: lead.id,
      previous_status: lead.status,
      status: parsed.status,
      requested_sku: lead.requestedSku,
      target_daily_spend_cents: lead.targetDailySpendCents,
    },
  });

  revalidatePath("/dashboard/revenue");
}

export async function activateStandingOrder(formData: FormData) {
  await requireOperator();
  const parsed = standingOrderActionSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  const order = await approveStandingOrder(parsed.standingOrderId);

  revalidatePath("/dashboard/revenue");
  revalidatePath(`/standing-orders/${order.id}`);
  revalidatePath(`/dashboard/agents/${order.agentId}/spending`);
}

export async function pauseStandingOrder(formData: FormData) {
  await requireOperator();
  const parsed = standingOrderActionSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  await setStandingOrderStatus(parsed.standingOrderId, "paused");

  revalidatePath("/dashboard/revenue");
  revalidatePath(`/standing-orders/${parsed.standingOrderId}`);
}

export async function cancelStandingOrder(formData: FormData) {
  await requireOperator();
  const parsed = standingOrderActionSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  await setStandingOrderStatus(parsed.standingOrderId, "cancelled");

  revalidatePath("/dashboard/revenue");
  revalidatePath(`/standing-orders/${parsed.standingOrderId}`);
}

export async function markCheckoutFollowedUp(formData: FormData) {
  await requireOperator();
  const parsed = checkoutIntentActionSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  const intent = await prisma.checkoutIntent.findUnique({
    where: { id: parsed.checkoutIntentId },
  });
  if (!intent) throw new Error("Unknown checkout intent.");

  const updated = await prisma.checkoutIntent.update({
    where: { id: intent.id },
    data: {
      followupCount: { increment: 1 },
      lastFollowedUpAt: new Date(),
    },
  });

  await writeAuditLog({
    organizationId: intent.organizationId,
    actorType: "user",
    action: "checkout_intent.followed_up",
    metadata: {
      checkout_intent_id: intent.id,
      stripe_session_id: intent.stripeSessionId,
      bundle: intent.bundleId,
      amount_cents: intent.amountCents,
      followup_count: updated.followupCount,
    },
  });

  revalidatePath("/dashboard/revenue");
  if (intent.recoveryToken) {
    revalidatePath(`/checkout/${intent.recoveryToken}`);
  }
}

export async function backfillCheckoutRecoveryLinks() {
  await requireOperator();
  const result = await backfillCheckoutRecoveryTokens();

  revalidatePath("/dashboard/revenue");
  revalidatePath("/api/revenue/readiness");
  revalidatePath("/api/revenue/outreach");
  revalidatePath("/api/revenue/close-plan");

  for (const repaired of result.repaired) {
    revalidatePath(`/checkout/${repaired.recovery_token}`);
  }
}

export async function syncOpenCheckoutPayments() {
  await requireOperator();
  await syncOpenCheckoutIntentsWithStripe();

  revalidatePath("/dashboard/revenue");
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/receipts");
  revalidatePath("/api/revenue/readiness");
  revalidatePath("/api/revenue/outreach");
  revalidatePath("/api/revenue/close-plan");
}
