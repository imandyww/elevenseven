import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

// Usage: npm run agent:create -- "agent-name" [organization_id]
// Self-contained (no "@/*" imports) so plain `node` can run it.
const prisma = new PrismaClient();

async function main() {
  const name = process.argv[2];
  const organizationId = process.argv[3] ?? "org_demo";

  if (!name) {
    console.error('Usage: npm run agent:create -- "agent-name" [organization_id]');
    process.exit(1);
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    console.error(`Unknown organization "${organizationId}". Run: npm run db:seed`);
    process.exit(1);
  }

  const rawKey = `ag_live_${randomBytes(16).toString("hex")}`;
  const agent = await prisma.agent.create({
    data: {
      organizationId,
      name,
      status: "active",
      keyHash: createHash("sha256").update(rawKey).digest("hex"),
      keyPrefix: rawKey.slice(0, 12),
      policy: { create: {} }, // defaults: 100c/day, 1000c/month, 50c/purchase
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId,
      actorType: "user",
      action: "agent.created",
      metadataJson: JSON.stringify({ agent_id: agent.id, name }),
    },
  });

  console.log(`Created agent "${name}" (${agent.id}) in ${organizationId}.`);
  console.log("");
  console.log("API key (shown ONCE — store it securely):");
  console.log(`  ${rawKey}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
