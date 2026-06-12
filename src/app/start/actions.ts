"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { ApiError } from "@/lib/api-errors";
import type { BundleId } from "@/lib/bundles";
import {
  clientIpFromHeaders,
  enforceCreationRateLimit,
} from "@/lib/rate-limit";
import {
  createSelfServeStart,
  selfServeStartSchema,
} from "@/lib/self-serve-start";
import { originFromHeaders } from "@/lib/site";

const startSchema = selfServeStartSchema.extend({
  companyUrl2: z.string().optional(),
});

export interface StartState {
  ok: boolean;
  message: string;
  organizationId?: string;
  agentId?: string;
  agentName?: string;
  rawKey?: string;
  keyPrefix?: string;
  targetDailySpendCents?: number;
  checkoutBundleId?: BundleId;
  checkoutAmountCents?: number;
  checkoutCreditsCents?: number;
  checkoutUrl?: string;
  checkoutRecoveryUrl?: string;
  checkoutIntentId?: string;
  checkoutError?: string;
}

export async function startWorkspace(
  _prevState: StartState,
  formData: FormData,
): Promise<StartState> {
  const parsed = startSchema.safeParse(Object.fromEntries(formData.entries()));
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
      message: "Workspace created. Continue to funding when ready.",
    };
  }

  const requestHeaders = await headers();
  try {
    await enforceCreationRateLimit(clientIpFromHeaders(requestHeaders));
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }

  const created = await createSelfServeStart(data, {
    origin: originFromHeaders(requestHeaders),
  });

  return {
    ok: true,
    message: created.checkoutUrl
      ? "Workspace created. Store the agent key now, then open the prepared Stripe checkout."
      : "Workspace created. Store the agent key now, then fund this wallet through Stripe.",
    organizationId: created.organizationId,
    agentId: created.agentId,
    agentName: created.agentName,
    rawKey: created.rawKey,
    keyPrefix: created.keyPrefix,
    targetDailySpendCents: created.targetDailySpendCents,
    checkoutBundleId: created.checkoutBundleId,
    checkoutAmountCents: created.checkoutAmountCents,
    checkoutCreditsCents: created.checkoutCreditsCents,
    checkoutUrl: created.checkoutUrl,
    checkoutRecoveryUrl: created.checkoutRecoveryUrl,
    checkoutIntentId: created.checkoutIntentId,
    checkoutError: created.checkoutError,
  };
}
