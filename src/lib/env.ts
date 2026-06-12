// Fail-loud production env validation, run once at server start from
// src/instrumentation.ts. Dev fallbacks (open operator gate, in-memory rate
// limits, permissive cron auth) must never reach production silently.

const isProduction = () => process.env.NODE_ENV === "production";

export function assertProductionEnv(): void {
  if (!isProduction()) return;
  // `next build` also runs with NODE_ENV=production; only enforce on a real
  // server instance so builds don't require runtime secrets.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const problems: string[] = [];

  const required = [
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STANDING_ORDER_RUN_SECRET",
    "OPERATOR_DASHBOARD_SECRET",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "NEXT_PUBLIC_APP_URL",
  ];
  for (const name of required) {
    if (!process.env[name]?.trim()) problems.push(`${name} is not set`);
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  if (dbUrl.startsWith("file:")) {
    problems.push("DATABASE_URL points at SQLite; production requires Postgres");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (appUrl && (!appUrl.startsWith("https://") || appUrl.includes("localhost"))) {
    problems.push("NEXT_PUBLIC_APP_URL must be a public https origin");
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (stripeKey.startsWith("sk_test_")) {
    if (process.env.REQUIRE_LIVE_STRIPE === "true") {
      problems.push(
        "STRIPE_SECRET_KEY is a test key but REQUIRE_LIVE_STRIPE=true (live cutover incomplete)",
      );
    } else {
      console.warn(
        "[env] STRIPE_SECRET_KEY is a TEST key — no real revenue. Set REQUIRE_LIVE_STRIPE=true after cutover to make this fatal.",
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start with unsafe production config:\n- ${problems.join("\n- ")}`,
    );
  }
}
