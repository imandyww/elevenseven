import { NextResponse } from "next/server";
import { agentCommerceDiscoveryPayload } from "@/lib/agent-discovery";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(agentCommerceDiscoveryPayload());
}
