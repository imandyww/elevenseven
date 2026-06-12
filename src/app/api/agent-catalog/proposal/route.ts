import { NextResponse } from "next/server";
import { z } from "zod";
import { createAgentBuyerProposal } from "@/lib/agent-proposals";

const bodySchema = z.object({
  organization_name: z.string().trim().min(2).max(120),
  billing_email: z.string().trim().email().max(200),
  website: z.string().trim().max(200).optional(),
  agent_name: z.string().trim().min(2).max(80).optional(),
  workflow: z.string().trim().min(20).max(1200),
  task: z.string().trim().max(2000).optional(),
  trigger: z.string().trim().max(120).optional(),
  risk_level: z.enum(["low", "medium", "high", "critical"]).optional(),
  budget_cents: z.number().int().positive().optional(),
  max_total_cents: z.number().int().positive().optional(),
  target_daily_spend_cents: z.number().int().min(100000).max(500000).optional(),
  target_daily_revenue_cents: z.number().int().min(100000).max(500000).optional(),
  capabilities: z.array(z.string().trim().max(120)).max(20).optional(),
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
          message: `Invalid proposal request. ${detail}`,
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json(createAgentBuyerProposal(body));
}
