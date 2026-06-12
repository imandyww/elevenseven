import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ApiError } from "./api-errors";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

// Unauthenticated creation endpoints (/start, /pilot, /api/buyer/start-checkout)
// get a much tighter, IP-keyed budget — they write orgs/agents/wallets and
// open Stripe Checkout sessions, which makes them a card-testing vector.
const CREATION_PER_MINUTE = 5;
const CREATION_PER_DAY = 20;

// Distributed limits via Upstash REST (works from serverless, no VPC needed).
// Without the env vars we fall back to the in-memory sliding window — fine for
// one instance / local dev; production env validation requires Upstash.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const agentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 m"),
      prefix: "rl:agent",
    })
  : null;

const creationMinuteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(CREATION_PER_MINUTE, "1 m"),
      prefix: "rl:create:1m",
    })
  : null;

const creationDayLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(CREATION_PER_DAY, "1 d"),
      prefix: "rl:create:1d",
    })
  : null;

// In-memory fallback, keyed by `${bucket}:${key}`. Also the degraded path
// when Redis is unreachable — the limiter must never take the API down.
const windows = new Map<string, number[]>();

async function allow(
  limiter: Ratelimit | null,
  key: string,
  bucket: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  if (limiter) {
    try {
      return (await limiter.limit(key)).success;
    } catch (e) {
      console.error("[rate-limit] redis unavailable, using in-memory window:", e);
    }
  }
  return memoryAllow(`${bucket}:${key}`, max, windowMs);
}

function memoryAllow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (windows.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= max) return false;

  hits.push(now);
  windows.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (windows.size > 10_000) {
    for (const [k, v] of windows) {
      if (v.every((t) => t <= cutoff)) windows.delete(k);
    }
  }
  return true;
}

/** Per-agent limit on /v1 routes, keyed by API key hash. */
export async function enforceRateLimit(key: string): Promise<void> {
  const ok = await allow(agentLimiter, key, "agent", MAX_REQUESTS, WINDOW_MS);

  if (!ok) {
    throw new ApiError(
      "rate_limited",
      `Rate limit exceeded (${MAX_REQUESTS} requests per minute). Slow down, speedy.`,
    );
  }
}

/**
 * Best-effort client IP for rate-limit keying. Behind Amplify/CloudFront the
 * first x-forwarded-for entry is the caller; locally there may be nothing.
 */
export function clientIpFromHeaders(headersLike: Headers): string {
  const forwarded = headersLike.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headersLike.get("x-real-ip") || "unknown";
}

/** IP-keyed limit on unauthenticated org/checkout creation. */
export async function enforceCreationRateLimit(ip: string): Promise<void> {
  const minuteOk = await allow(
    creationMinuteLimiter,
    ip,
    "create:1m",
    CREATION_PER_MINUTE,
    WINDOW_MS,
  );
  const dayOk = await allow(
    creationDayLimiter,
    ip,
    "create:1d",
    CREATION_PER_DAY,
    24 * 60 * WINDOW_MS,
  );

  if (!minuteOk || !dayOk) {
    throw new ApiError(
      "rate_limited",
      "Too many workspace or checkout requests from this address. Try again later, or email support.",
    );
  }
}
