import { NextResponse } from "next/server";
import { ApiError, errorResponse, internalErrorResponse } from "@/lib/api-errors";
import { authenticateAgent } from "@/lib/agent-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  agentSpendSinceCents,
  getBalanceCents,
  getWalletForOrg,
  startOfUtcDay,
  startOfUtcMonth,
} from "@/lib/credits";

/** GET /v1/balance — wallet balance, policy limits, and current spend. */
export async function GET(request: Request) {
  try {
    const agent = await authenticateAgent(request);
    enforceRateLimit(agent.keyHash);

    const wallet = await getWalletForOrg(agent.organizationId);
    const [balance, spentToday, spentMonth] = await Promise.all([
      wallet ? getBalanceCents(wallet.id) : Promise.resolve(0),
      agentSpendSinceCents(agent.id, startOfUtcDay()),
      agentSpendSinceCents(agent.id, startOfUtcMonth()),
    ]);

    return NextResponse.json({
      organization_id: agent.organizationId,
      agent_id: agent.id,
      wallet_balance_cents: balance,
      currency: wallet?.currency ?? "usd",
      agent_policy: {
        daily_limit_cents: agent.policy.dailyLimitCents,
        monthly_limit_cents: agent.policy.monthlyLimitCents,
        per_purchase_limit_cents: agent.policy.perPurchaseLimitCents,
      },
      spent_today_cents: spentToday,
      spent_this_month_cents: spentMonth,
    });
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    return internalErrorResponse(e);
  }
}
