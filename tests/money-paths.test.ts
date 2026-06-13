import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as consumeEntitlement } from "@/app/v1/entitlements/[id]/consume/route";
import { generateApiKey, type AuthedAgent } from "@/lib/agent-auth";
import { ApiError } from "@/lib/api-errors";
import { getBalanceCents } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { DEFAULT_POLICY } from "@/lib/policy";
import { processPurchase } from "@/lib/purchases";
import { reconcilePaidCheckoutSession } from "@/lib/stripe-checkout-reconciliation";

// landing-page-copy-fixer: $1, allowed_uses 1, never expires.
const SKU = "landing-page-copy-fixer";
const SKU_PRICE_CENTS = 100;

function nonce(): string {
  return randomBytes(6).toString("hex");
}

async function createOrgWithAgent(options?: {
  balanceCents?: number;
  policy?: Partial<Prisma.AgentPolicyCreateWithoutAgentInput>;
}): Promise<{ organizationId: string; walletId: string; agent: AuthedAgent; rawKey: string }> {
  const organizationId = `org_test_${nonce()}`;
  await prisma.organization.create({
    data: { id: organizationId, name: `Test ${organizationId}`, source: "manual" },
  });
  const wallet = await prisma.wallet.create({
    data: { organizationId, currency: "usd" },
  });

  const balanceCents = options?.balanceCents ?? 0;
  if (balanceCents > 0) {
    await prisma.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        organizationId,
        type: "adjustment",
        amountCents: balanceCents,
        balanceAfterCents: balanceCents,
        source: "dev_grant",
        idempotencyKey: `grant:test:${nonce()}`,
      },
    });
  }

  const key = generateApiKey();
  const agent = await prisma.agent.create({
    data: {
      organizationId,
      name: "test-agent",
      status: "active",
      keyHash: key.keyHash,
      keyPrefix: key.keyPrefix,
      policy: { create: { ...DEFAULT_POLICY, ...options?.policy } },
    },
    include: { policy: true },
  });

  return {
    organizationId,
    walletId: wallet.id,
    agent: agent as AuthedAgent,
    rawKey: key.rawKey,
  };
}

function paidSession(
  sessionId: string,
  organizationId: string,
  creditsCents: number,
): Stripe.Checkout.Session {
  return {
    id: sessionId,
    payment_status: "paid",
    metadata: {
      organization_id: organizationId,
      credits_cents: String(creditsCents),
    },
    customer: null,
  } as unknown as Stripe.Checkout.Session;
}

describe("stripe reconciliation", () => {
  it("credits exactly once per checkout session, including webhook replays", async () => {
    const { organizationId, walletId } = await createOrgWithAgent();
    const sessionId = `cs_test_${nonce()}`;
    const eventId = `evt_test_${nonce()}`;
    const event = { id: eventId, type: "checkout.session.completed", rawJson: "{}" };

    const first = await reconcilePaidCheckoutSession({
      session: paidSession(sessionId, organizationId, 50_000),
      stripeEvent: event,
      source: "stripe_webhook",
    });
    expect(first.status).toBe("credited");
    expect(await getBalanceCents(walletId)).toBe(50_000);

    // Same event id (webhook retry) and a manual sync of the same session:
    // neither may credit again.
    const replay = await reconcilePaidCheckoutSession({
      session: paidSession(sessionId, organizationId, 50_000),
      stripeEvent: event,
      source: "stripe_webhook",
    });
    expect(replay.status).toBe("deduped");

    const manualSync = await reconcilePaidCheckoutSession({
      session: paidSession(sessionId, organizationId, 50_000),
      source: "manual_sync",
    });
    expect(manualSync.status).not.toBe("credited");

    const credits = await prisma.ledgerEntry.count({
      where: { walletId, type: "credit" },
    });
    expect(credits).toBe(1);
    expect(await getBalanceCents(walletId)).toBe(50_000);
  });

  it("ignores unpaid sessions", async () => {
    const { organizationId, walletId } = await createOrgWithAgent();
    const session = {
      ...paidSession(`cs_test_${nonce()}`, organizationId, 50_000),
      payment_status: "unpaid",
    } as unknown as Stripe.Checkout.Session;

    const result = await reconcilePaidCheckoutSession({
      session,
      source: "stripe_webhook",
    });
    expect(result.status).toBe("ignored");
    expect(await getBalanceCents(walletId)).toBe(0);
  });
});

describe("agent purchases", () => {
  const request = (reason = "integration test purchase") => ({
    sku: SKU,
    quantity: 1,
    reason,
  });

  it("completes a purchase, freezes a receipt, and debits the wallet", async () => {
    const { agent, walletId } = await createOrgWithAgent({ balanceCents: 1_000 });

    const result = await processPurchase(agent, `idem-${nonce()}`, request());
    expect(result.status).toBe(201);
    expect(result.body.total_cents).toBe(SKU_PRICE_CENTS);
    expect(await getBalanceCents(walletId)).toBe(1_000 - SKU_PRICE_CENTS);

    const order = await prisma.order.findUnique({
      where: { id: result.body.order_id as string },
      include: { receipt: true, entitlements: true },
    });
    expect(order?.status).toBe("completed");
    expect(order?.receipt).toBeTruthy();
    expect(order?.entitlements[0]?.remainingUses).toBe(1);
  });

  it("replays idempotently (200, same order) and conflicts on a mutated body (409)", async () => {
    const { agent, walletId } = await createOrgWithAgent({ balanceCents: 1_000 });
    const key = `idem-${nonce()}`;

    const first = await processPurchase(agent, key, request());
    const replay = await processPurchase(agent, key, request());
    expect(replay.status).toBe(200);
    expect(replay.body.order_id).toBe(first.body.order_id);
    // Replay must not debit again.
    expect(await getBalanceCents(walletId)).toBe(1_000 - SKU_PRICE_CENTS);

    await expect(
      processPurchase(agent, key, request("a different reason")),
    ).rejects.toMatchObject({ code: "duplicate_request_conflict" });
  });

  it("denies on insufficient credits and opens a funding request", async () => {
    const { agent, organizationId } = await createOrgWithAgent({ balanceCents: 10 });

    const error = await processPurchase(agent, `idem-${nonce()}`, request()).then(
      () => null,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("insufficient_credits");

    const fundingRequests = await prisma.fundingRequest.findMany({
      where: { organizationId },
    });
    expect(fundingRequests).toHaveLength(1);
    expect(fundingRequests[0].sku).toBe(SKU);
    expect(fundingRequests[0].source).toBe("purchase_denied");
  });

  it("enforces policy (blocked SKU)", async () => {
    const { agent } = await createOrgWithAgent({
      balanceCents: 1_000,
      policy: { blockedSkusJson: JSON.stringify([SKU]) },
    });

    await expect(
      processPurchase(agent, `idem-${nonce()}`, request()),
    ).rejects.toMatchObject({ code: "sku_blocked" });
  });

  it("never overdrafts under concurrent purchases", async () => {
    // Exactly two purchases fit in the balance; fire five concurrently.
    const { agent, walletId } = await createOrgWithAgent({
      balanceCents: SKU_PRICE_CENTS * 2,
    });

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, i) =>
        processPurchase(agent, `idem-concurrent-${i}-${nonce()}`, request()),
      ),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    expect(succeeded).toBeLessThanOrEqual(2);
    for (const failure of failures) {
      expect(failure.reason).toBeInstanceOf(ApiError);
      expect(["insufficient_credits", "internal_error"]).toContain(
        (failure.reason as ApiError).code,
      );
    }

    const balance = await getBalanceCents(walletId);
    expect(balance).toBe(SKU_PRICE_CENTS * (2 - succeeded));
    expect(balance).toBeGreaterThanOrEqual(0);
  });
});

describe("entitlement consumption", () => {
  it("is idempotent per Idempotency-Key", async () => {
    const { agent, rawKey } = await createOrgWithAgent({ balanceCents: 1_000 });
    const purchase = await processPurchase(agent, `idem-${nonce()}`, {
      sku: SKU,
      quantity: 2,
      reason: "consume test",
    });
    const entitlementId = purchase.body.entitlement_id as string;
    const key = `consume-${nonce()}`;

    const consume = () =>
      consumeEntitlement(
        new Request("http://test.local/v1/entitlements/consume", {
          method: "POST",
          headers: {
            authorization: `Bearer ${rawKey}`,
            "idempotency-key": key,
          },
        }),
        { params: Promise.resolve({ id: entitlementId }) },
      );

    const first = await consume();
    expect(first.status).toBe(200);

    const replay = await consume();
    expect(replay.status).toBe(200);

    const entitlement = await prisma.entitlement.findUnique({
      where: { id: entitlementId },
    });
    // Two uses were purchased; one key consumed exactly one despite the replay.
    expect(entitlement?.remainingUses).toBe(1);
  });
});

describe("rate limiting (in-memory path)", () => {
  it("returns rate_limited after 60 requests in a minute for one key", async () => {
    const { enforceRateLimit } = await import("@/lib/rate-limit");
    const key = `keyhash-${nonce()}`;

    for (let i = 0; i < 60; i += 1) {
      await enforceRateLimit(key);
    }
    await expect(enforceRateLimit(key)).rejects.toMatchObject({
      code: "rate_limited",
    });
    // Other keys are unaffected.
    await expect(enforceRateLimit(`other-${nonce()}`)).resolves.toBeUndefined();
  });
});

describe("ledger CHECK constraint", () => {
  it("rejects a negative balanceAfterCents at the database level", async () => {
    const { walletId, organizationId } = await createOrgWithAgent();

    await expect(
      prisma.ledgerEntry.create({
        data: {
          walletId,
          organizationId,
          type: "debit",
          amountCents: 100,
          balanceAfterCents: -100,
          source: "agent_purchase",
          idempotencyKey: `bad:${nonce()}`,
        },
      }),
    ).rejects.toThrowError(/constraint|check/i);
  });
});

beforeAll(async () => {
  await prisma.$connect();
});
