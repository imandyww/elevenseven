import { randomBytes } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

// Usage: npm run credits:grant -- org_demo 1000
// Dev-only convenience: appends an "adjustment" ledger credit so the agent
// API can be exercised without Stripe. Production credits come exclusively
// from the verified Stripe webhook.
const prisma = new PrismaClient();

async function main() {
  const organizationId = process.argv[2];
  const amountCents = Number.parseInt(process.argv[3] ?? "", 10);

  if (!organizationId || !Number.isInteger(amountCents) || amountCents === 0) {
    console.error("Usage: npm run credits:grant -- <organization_id> <amount_cents>");
    process.exit(1);
  }

  const wallet = await prisma.wallet.findUnique({ where: { organizationId } });
  if (!wallet) {
    console.error(`No wallet for "${organizationId}". Run: npm run db:seed`);
    process.exit(1);
  }

  const entry = await prisma.$transaction(
    async (tx) => {
      const latest = await tx.ledgerEntry.findFirst({
        where: { walletId: wallet.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const balance = latest?.balanceAfterCents ?? 0;
      const balanceAfterCents = balance + amountCents;
      if (balanceAfterCents < 0) {
        throw new Error(`Refusing: balance would go negative (${balanceAfterCents}).`);
      }

      const created = await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          organizationId,
          type: "adjustment",
          amountCents: Math.abs(amountCents),
          balanceAfterCents,
          source: "dev_grant",
          idempotencyKey: `grant:${randomBytes(8).toString("hex")}`,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorType: "system",
          action: "wallet.adjusted",
          metadataJson: JSON.stringify({
            amount_cents: amountCents,
            balance_after_cents: balanceAfterCents,
            source: "dev_grant",
          }),
        },
      });

      return created;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  console.log(
    `Granted ${amountCents}c to ${organizationId}. New balance: ${entry.balanceAfterCents}c.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
