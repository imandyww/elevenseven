import type { Prisma, PrismaClient, Wallet } from "@prisma/client";
import { prisma } from "./db";

/** Accepts the root client or a transaction client, so every helper can run
 * inside the serializable transactions that guard wallet mutations. */
export type Db = PrismaClient | Prisma.TransactionClient;

export async function getWalletForOrg(
  organizationId: string,
  db: Db = prisma,
): Promise<Wallet | null> {
  return db.wallet.findUnique({ where: { organizationId } });
}

/** Balance = balanceAfterCents of the latest ledger entry. The ledger is
 * immutable and append-only; there is no mutable balance column. */
export async function getBalanceCents(walletId: string, db: Db = prisma): Promise<number> {
  const latest = await db.ledgerEntry.findFirst({
    where: { walletId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { balanceAfterCents: true },
  });
  return latest?.balanceAfterCents ?? 0;
}

interface LedgerWrite {
  walletId: string;
  organizationId: string;
  type: "credit" | "debit" | "refund" | "adjustment";
  amountCents: number;
  source: string;
  agentId?: string;
  orderId?: string;
  externalRef?: string;
  idempotencyKey: string;
}

/**
 * Append a ledger entry, computing balanceAfterCents from the latest entry.
 * MUST be called inside a serializable transaction (pass the tx client).
 * Throws if a debit would take the balance negative.
 */
export async function appendLedgerEntry(entry: LedgerWrite, db: Db) {
  const balance = await getBalanceCents(entry.walletId, db);
  const delta =
    entry.type === "debit" ? -entry.amountCents : entry.amountCents;
  const balanceAfterCents = balance + delta;

  if (balanceAfterCents < 0) {
    throw new Error(
      `Ledger invariant violation: entry would make balance negative (${balanceAfterCents}).`,
    );
  }

  return db.ledgerEntry.create({
    data: {
      walletId: entry.walletId,
      organizationId: entry.organizationId,
      agentId: entry.agentId,
      orderId: entry.orderId,
      type: entry.type,
      amountCents: entry.amountCents,
      balanceAfterCents,
      source: entry.source,
      externalRef: entry.externalRef,
      idempotencyKey: entry.idempotencyKey,
    },
  });
}

export function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function startOfUtcMonth(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Sum of an agent's completed orders since `since`. */
export async function agentSpendSinceCents(
  agentId: string,
  since: Date,
  db: Db = prisma,
): Promise<number> {
  const result = await db.order.aggregate({
    where: { agentId, status: "completed", createdAt: { gte: since } },
    _sum: { totalCents: true },
  });
  return result._sum.totalCents ?? 0;
}

export async function writeAuditLog(
  entry: {
    organizationId?: string;
    actorType: "user" | "agent" | "system";
    actorId?: string;
    action: string;
    metadata: Record<string, unknown>;
  },
  db: Db = prisma,
) {
  return db.auditLog.create({
    data: {
      organizationId: entry.organizationId,
      actorType: entry.actorType,
      actorId: entry.actorId,
      action: entry.action,
      metadataJson: JSON.stringify(entry.metadata),
    },
  });
}
