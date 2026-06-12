import { createHash, randomBytes } from "crypto";
import type { Agent, AgentPolicy } from "@prisma/client";
import { prisma } from "./db";
import { ApiError } from "./api-errors";

export type AuthedAgent = Agent & { policy: AgentPolicy };

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/** Generate a new agent API key. The raw key is shown exactly once. */
export function generateApiKey(): {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  const rawKey = `ag_live_${randomBytes(16).toString("hex")}`;
  return {
    rawKey,
    keyHash: hashApiKey(rawKey),
    keyPrefix: rawKey.slice(0, 12),
  };
}

/**
 * Resolve the Bearer token to an active agent with its policy.
 * Throws ApiError("invalid_api_key") for missing/unknown/paused/revoked keys.
 */
export async function authenticateAgent(request: Request): Promise<AuthedAgent> {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    throw new ApiError(
      "invalid_api_key",
      "Missing or malformed Authorization header. Expected: Bearer ag_live_...",
    );
  }

  const agent = await prisma.agent.findUnique({
    where: { keyHash: hashApiKey(match[1]) },
    include: { policy: true },
  });

  if (!agent || !agent.policy) {
    throw new ApiError("invalid_api_key", "Unknown API key.");
  }
  if (agent.status !== "active") {
    throw new ApiError(
      "invalid_api_key",
      `This agent has been ${agent.status} by its organization.`,
    );
  }

  // Best-effort freshness marker; never block the request on it.
  prisma.agent
    .update({ where: { id: agent.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return agent as AuthedAgent;
}
