import { NextResponse } from "next/server";
import { runDueStandingOrders } from "@/lib/standing-orders";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.STANDING_ORDER_RUN_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * POST /api/standing-orders/run - execute due active standing orders.
 *
 * In production set STANDING_ORDER_RUN_SECRET and call this from cron with
 * Authorization: Bearer <secret>.
 */
export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message:
            "Standing order runner requires STANDING_ORDER_RUN_SECRET in production.",
        },
      },
      { status: 401 },
    );
  }

  const ranAt = new Date();
  const results = await runDueStandingOrders(ranAt);

  return NextResponse.json({
    ran_at: ranAt.toISOString(),
    count: results.length,
    results,
  });
}
