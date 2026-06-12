import { ApiError } from "./api-errors";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

// In-memory sliding window, keyed by API key hash. Good enough for a
// single-instance deployment; swap for Redis/Upstash when scaling out.
// (Dev hot-reload resets it — that's fine.)
const windows = new Map<string, number[]>();

export function enforceRateLimit(key: string): void {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (windows.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= MAX_REQUESTS) {
    throw new ApiError(
      "rate_limited",
      `Rate limit exceeded (${MAX_REQUESTS} requests per minute). Slow down, speedy.`,
    );
  }

  hits.push(now);
  windows.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (windows.size > 10_000) {
    for (const [k, v] of windows) {
      if (v.every((t) => t <= cutoff)) windows.delete(k);
    }
  }
}
