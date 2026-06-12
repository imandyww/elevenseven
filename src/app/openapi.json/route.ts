import { NextResponse } from "next/server";
import { agentStoreOpenApiDocument } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(agentStoreOpenApiDocument());
}
