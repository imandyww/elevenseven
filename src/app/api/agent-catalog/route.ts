import { NextResponse } from "next/server";
import { agentCatalogPayload } from "@/lib/agent-catalog";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(agentCatalogPayload());
}
