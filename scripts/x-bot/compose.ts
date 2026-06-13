// Tweet composition: live catalog fetch (best-effort) + Claude generation.
// Throws on any composition failure so the orchestrator can fall back to
// the handwritten templates.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ANGLE_BRIEFS, FALLBACK_CATALOG, STORE_URL } from "./templates.ts";
import type { Angle, CatalogProduct } from "./types.ts";

const MAX_TWEET_CHARS = 280;
const CATALOG_URL = `${STORE_URL}/api/agent-catalog`;

const TweetSchema = z.object({ tweet: z.string() });

const COMPOSE_SYSTEM = `You write single tweets for the X account of Eleven Seven (${STORE_URL}), a live agent-commerce store where AI agents buy capability micro-upgrades — verification passes, evals, production traces, security red teams, compliance briefs — priced $0.10 to $1,000. Humans prepay a credit wallet via Stripe; agents spend credits under server-enforced policies and every purchase produces an immutable ledger entry and a machine-readable receipt.

Audience: AI engineers, agent-platform builders, and AI agents themselves.

Voice rules:
- Concrete and technical. Zero hype words ("revolutionary", "game-changing", "unlock").
- No emojis. At most one hashtag, usually none.
- 270 characters maximum.
- Must contain ${STORE_URL} exactly once.
- Must be substantially different in wording and structure from every recent post provided.
- Mention only real product names and prices from the catalog excerpt given.`;

export async function fetchCatalogExcerpt(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(CATALOG_URL, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`catalog fetch: HTTP ${res.status}`);
    const body = await res.json();
    const products = Array.isArray(body?.products) ? body.products : null;
    if (!products || products.length === 0) throw new Error("catalog fetch: no products");
    return products.slice(0, 10).map((p: Record<string, unknown>) => ({
      sku: String(p.sku ?? ""),
      name: String(p.name ?? ""),
      price: Number(p.price ?? 0),
      category: String(p.category ?? ""),
      pitch: String(p.description ?? p.pitch ?? ""),
    }));
  } catch (err) {
    console.warn(`live catalog unavailable (${(err as Error).message}); using bundled fallback`);
    return FALLBACK_CATALOG;
  }
}

export async function composeTweet(
  anthropic: Anthropic,
  angle: Angle,
  catalog: CatalogProduct[],
  recentPosts: string[],
): Promise<string> {
  const recent = recentPosts.slice(-10);
  const userPrompt = [
    `Angle for this tweet: ${angle} — ${ANGLE_BRIEFS[angle]}`,
    "",
    "Catalog excerpt (real data, use only this):",
    JSON.stringify(catalog),
    "",
    recent.length > 0
      ? `Recent posts (do NOT resemble these):\n${recent.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "No recent posts yet.",
  ].join("\n");

  const response = await anthropic.messages.parse({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    thinking: { type: "disabled" },
    output_config: {
      effort: "low",
      format: zodOutputFormat(TweetSchema),
    },
    system: COMPOSE_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const tweet = response.parsed_output?.tweet.trim();
  if (!tweet) throw new Error("compose: no parsed output");
  if (tweet.length > MAX_TWEET_CHARS) {
    throw new Error(`compose: tweet too long (${tweet.length} chars)`);
  }
  if (!tweet.includes(STORE_URL)) {
    throw new Error("compose: tweet missing store URL");
  }
  return tweet;
}
