"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { ApiError } from "@/lib/api-errors";
import { writeAuditLog } from "@/lib/credits";
import { prisma } from "@/lib/db";
import {
  clientIpFromHeaders,
  enforceCreationRateLimit,
} from "@/lib/rate-limit";

const pilotLeadSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(200),
  website: z.string().trim().max(200).optional(),
  requestedSku: z
    .enum([
      "landing-page-copy-fixer",
      "lead-research-prompt-pack",
      "json-formatter-utility",
    ])
    .default("landing-page-copy-fixer"),
  targetDailySpendCents: z.coerce.number().int().min(100000).max(500000),
  useCase: z.string().trim().min(20).max(1200),
  companyUrl2: z.string().optional(),
});

export interface PilotLeadState {
  ok: boolean;
  message: string;
  leadId?: string;
}

export async function createPilotLead(
  _prevState: PilotLeadState,
  formData: FormData,
): Promise<PilotLeadState> {
  const parsed = pilotLeadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Check the form fields. Use a valid email and describe the agent workflow in at least 20 characters.",
    };
  }

  const data = parsed.data;
  if (data.companyUrl2) {
    return {
      ok: true,
      message: "Request received.",
    };
  }

  try {
    await enforceCreationRateLimit(clientIpFromHeaders(await headers()));
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }

  const lead = await prisma.pilotLead.create({
    data: {
      organizationName: data.organizationName,
      contactName: data.contactName || null,
      email: data.email,
      website: data.website || null,
      useCase: data.useCase,
      targetDailySpendCents: data.targetDailySpendCents,
      requestedSku: data.requestedSku,
      source: "pilot_page",
    },
  });

  await writeAuditLog({
    actorType: "user",
    action: "pilot_lead.created",
    metadata: {
      lead_id: lead.id,
      organization_name: lead.organizationName,
      requested_sku: lead.requestedSku,
      target_daily_spend_cents: lead.targetDailySpendCents,
    },
  });

  return {
    ok: true,
    message:
      "Pilot request received. The next step is funding an agent wallet and creating a buyer key.",
    leadId: lead.id,
  };
}
