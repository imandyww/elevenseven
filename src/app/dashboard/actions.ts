"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/credits";

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

function csvToJsonArray(csv: string): string {
  const items = csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}

export async function updatePolicy(formData: FormData) {
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
  await setAgentStatus(String(formData.get("agentId")), "paused");
}

export async function resumeAgent(formData: FormData) {
  await setAgentStatus(String(formData.get("agentId")), "active");
}

export async function revokeAgent(formData: FormData) {
  await setAgentStatus(String(formData.get("agentId")), "revoked");
}
