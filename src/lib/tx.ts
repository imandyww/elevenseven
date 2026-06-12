import { Prisma } from "@prisma/client";

// Postgres can abort Serializable transactions under concurrency (Prisma
// P2034) — a code path SQLite never exercised. Both money transactions are
// idempotency-keyed, so a bounded retry is safe.
const MAX_ATTEMPTS = 3;

export async function retrySerializable<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (e) {
      const isSerializationFailure =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034";
      if (!isSerializationFailure) throw e;
      lastError = e;
    }
  }
  throw lastError;
}
