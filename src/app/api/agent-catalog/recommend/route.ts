import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendPurchasePlan } from "@/lib/agent-catalog";

const bodySchema = z.object({
  task: z.string().max(2000).optional(),
  trigger: z.string().max(120).optional(),
  risk_level: z.enum(["low", "medium", "high", "critical"]).optional(),
  budget_cents: z.number().int().positive().optional(),
  max_total_cents: z.number().int().positive().optional(),
  target_daily_revenue_cents: z.number().int().positive().optional(),
  capabilities: z.array(z.string().max(120)).max(20).optional(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (e) {
    const detail =
      e instanceof z.ZodError
        ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Body must be valid JSON.";
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: `Invalid recommendation request. ${detail}`,
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json(recommendPurchasePlan(body));
}
