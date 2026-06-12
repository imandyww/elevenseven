-- DB-level backstop for the wallet's never-negative invariant. The
-- application enforces this inside serializable transactions; the CHECK
-- guarantees it even against manual writes or future bugs.
ALTER TABLE "LedgerEntry"
  ADD CONSTRAINT "ledger_balance_after_nonnegative"
  CHECK ("balanceAfterCents" >= 0);
