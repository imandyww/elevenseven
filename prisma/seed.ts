import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

// Self-contained on purpose: `node prisma/seed.ts` uses Node's TS type
// stripping, which doesn't resolve the "@/*" alias used by app code.
const prisma = new PrismaClient();

const DEMO_ORG_ID = "org_demo";

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {},
    create: { id: DEMO_ORG_ID, name: "Demo Organization" },
  });

  await prisma.wallet.upsert({
    where: { organizationId: org.id },
    update: {},
    create: { organizationId: org.id, currency: "usd" },
  });

  const existingAgent = await prisma.agent.findFirst({
    where: { organizationId: org.id, name: "demo-agent" },
  });

  if (existingAgent) {
    console.log(`Seed: org "${org.id}" and agent "demo-agent" already exist.`);
    console.log(`Agent id: ${existingAgent.id} (key was shown when first seeded)`);
    console.log(`Need a fresh key? Run: npm run agent:create -- fresh-agent`);
    return;
  }

  const rawKey = `ag_live_${randomBytes(16).toString("hex")}`;
  const agent = await prisma.agent.create({
    data: {
      organizationId: org.id,
      name: "demo-agent",
      status: "active",
      keyHash: createHash("sha256").update(rawKey).digest("hex"),
      keyPrefix: rawKey.slice(0, 12),
      policy: { create: {} }, // schema defaults = the spec's default policy
    },
  });

  console.log("Seeded demo data:");
  console.log(`  organization : ${org.id}`);
  console.log(`  agent        : ${agent.id} (demo-agent)`);
  console.log("");
  console.log("  Agent API key (shown ONCE — copy it now):");
  console.log(`  ${rawKey}`);
  console.log("");
  console.log("Next: npm run credits:grant -- org_demo 1000   # dev credits without Stripe");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
