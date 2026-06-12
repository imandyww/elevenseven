import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// Dedicated test database on the docker-compose Postgres (docker compose up -d).
// Created here on first run; migrated with `migrate deploy` (non-destructive)
// and truncated for a clean slate. Never points at dev or prod data.
const ADMIN_URL = "postgresql://agentstore:agentstore@localhost:5432/agentstore";
const TEST_DB_URL =
  "postgresql://agentstore:agentstore@localhost:5432/agentstore_test";

export default async function setup() {
  const admin = new PrismaClient({ datasourceUrl: ADMIN_URL });
  try {
    await admin.$executeRawUnsafe(`CREATE DATABASE agentstore_test`);
  } catch {
    // already exists
  } finally {
    await admin.$disconnect();
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: TEST_DB_URL,
      DIRECT_URL: TEST_DB_URL,
    },
  });

  const test = new PrismaClient({ datasourceUrl: TEST_DB_URL });
  try {
    await test.$executeRawUnsafe(
      `TRUNCATE "EntitlementConsumption","Entitlement","Receipt","OrderItem","Order",` +
        `"StandingOrder","FundingRequest","AgentPolicy","Agent","LedgerEntry",` +
        `"CheckoutIntent","StripeEvent","AuditLog","PilotLead","Wallet","Organization" CASCADE`,
    );
  } finally {
    await test.$disconnect();
  }
}
