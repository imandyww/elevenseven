import type { AgentPolicy } from "@prisma/client";
import type { Product } from "./types";
import { ApiError } from "./api-errors";
import { formatCents } from "./money";

function parseJsonArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function allowedCategories(policy: AgentPolicy): string[] {
  return parseJsonArray(policy.allowedCategoriesJson);
}

export function blockedSkus(policy: AgentPolicy): string[] {
  return parseJsonArray(policy.blockedSkusJson);
}

/**
 * Static (non-balance) policy checks for a proposed purchase.
 * Throws the matching ApiError; order of checks defines error precedence.
 */
export function enforcePurchasePolicy(
  policy: AgentPolicy,
  product: Product,
  totalCents: number,
  maxTotalCents: number | undefined,
): void {
  if (blockedSkus(policy).includes(product.sku)) {
    throw new ApiError(
      "sku_blocked",
      `The sku "${product.sku}" is blocked by this agent's spending policy.`,
    );
  }

  const allowed = allowedCategories(policy);
  if (allowed.length > 0 && !allowed.includes(product.category)) {
    throw new ApiError(
      "category_not_allowed",
      `Category "${product.category}" is not in this agent's allowed categories.`,
    );
  }

  if (maxTotalCents !== undefined && totalCents > maxTotalCents) {
    throw new ApiError(
      "invalid_request",
      `Total ${formatCents(totalCents)} exceeds the request's max_total_cents of ${formatCents(maxTotalCents)}.`,
    );
  }

  if (totalCents > policy.perPurchaseLimitCents) {
    throw new ApiError(
      "exceeds_per_purchase_limit",
      `Total ${formatCents(totalCents)} exceeds the per-purchase limit of ${formatCents(policy.perPurchaseLimitCents)}.`,
    );
  }

  if (totalCents > policy.requireHumanApprovalOverCents) {
    throw new ApiError(
      "requires_human_approval",
      `Purchases over ${formatCents(policy.requireHumanApprovalOverCents)} require human approval for this agent.`,
    );
  }
}

export function enforceSpendLimits(
  policy: AgentPolicy,
  spentTodayCents: number,
  spentThisMonthCents: number,
  totalCents: number,
): void {
  if (spentTodayCents + totalCents > policy.dailyLimitCents) {
    throw new ApiError(
      "exceeds_daily_limit",
      `This purchase would put today's spend at ${formatCents(spentTodayCents + totalCents)}, over the daily limit of ${formatCents(policy.dailyLimitCents)}.`,
    );
  }
  if (spentThisMonthCents + totalCents > policy.monthlyLimitCents) {
    throw new ApiError(
      "exceeds_monthly_limit",
      `This purchase would put this month's spend at ${formatCents(spentThisMonthCents + totalCents)}, over the monthly limit of ${formatCents(policy.monthlyLimitCents)}.`,
    );
  }
}

export const DEFAULT_POLICY = {
  dailyLimitCents: 500000,
  monthlyLimitCents: 10000000,
  perPurchaseLimitCents: 100000,
  allowedCategoriesJson: "[]",
  blockedSkusJson: "[]",
  requireHumanApprovalOverCents: 100000,
} as const;
