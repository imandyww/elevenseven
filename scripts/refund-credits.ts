import { Prisma, PrismaClient } from "@prisma/client";

// Usage: npm run credits:refund -- <organization_id> <amount_cents> <stripe_refund_id> [--pause-agents]
//
// Manual half of the refund runbook: after refunding the payment in the
// Stripe dashboard, run this to remove the matching credits from the wallet.
// Idempotent per Stripe refund id, so re-running is safe. Pass --pause-agents
// for dispute/chargeback cases so spend stops while you reconcile.
const prisma = new PrismaClient();

async function main() {
  const organizationId = process.argv[2];
  const amountCents = Number.parseInt(process.argv[3] ?? "", 10);
  const stripeRefundId = process.argv[4];
  const pauseAgents = process.argv.includes("--pause-agents");

  if (!organizationId || !Number.isInteger(amountCents) || amountCents <= 0 || !stripeRefundId) {
    console.error(
      "Usage: npm run credits:refund -- <organization_id> <amount_cents> <stripe_refund_id> [--pause-agents]",
    );
    process.exit(1);
  }

  const wallet = await prisma.wallet.findUnique({ where: { organizationId } });
  if (!wallet) {
    console.error(`No wallet for "${organizationId}".`);
    process.exit(1);
  }

  const idempotencyKey = `refund:${stripeRefundId}`;
  const existing = await prisma.ledgerEntry.findFirst({
    where: { walletId: wallet.id, idempotencyKey },
  });
  if (existing) {
    console.log(
      `Refund ${stripeRefundId} already applied (entry ${existing.id}, balance ${existing.balanceAfterCents}c). Nothing to do.`,
    );
    return;
  }

  const entry = await prisma.$transaction(
    async (tx) => {
      const latest = await tx.ledgerEntry.findFirst({
        where: { walletId: wallet.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const balance = latest?.balanceAfterCents ?? 0;
      const balanceAfterCents = balance - amountCents;
      if (balanceAfterCents < 0) {
        throw new Error(
          `Refusing: balance would go negative (${balanceAfterCents}c). ` +
            `The org spent part of these credits — refund at most ${balance}c, ` +
            `or handle the shortfall as a dispute loss before reconciling.`,
        );
      }

      const created = await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          organizationId,
          type: "refund",
          amountCents,
          balanceAfterCents,
          source: "stripe_refund",
          idempotencyKey,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorType: "system",
          action: "wallet.refunded",
          metadataJson: JSON.stringify({
            amount_cents: amountCents,
            balance_after_cents: balanceAfterCents,
            stripe_refund_id: stripeRefundId,
            paused_agents: pauseAgents,
          }),
        },
      });

      return created;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  console.log(
    `Removed ${amountCents}c from ${organizationId} for ${stripeRefundId}. New balance: ${entry.balanceAfterCents}c.`,
  );

  if (pauseAgents) {
    const paused = await prisma.agent.updateMany({
      where: { organizationId, status: "active" },
      data: { status: "paused" },
    });
    console.log(`Paused ${paused.count} active agent(s) for ${organizationId}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
