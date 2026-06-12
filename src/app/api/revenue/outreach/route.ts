import { NextResponse } from "next/server";
import {
  isOperatorContext,
  operatorUnauthorizedResponse,
} from "@/lib/operator-auth";
import { getRevenueOutreachQueue } from "@/lib/revenue-outreach";
import { originFromRequest } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isOperatorContext())) return operatorUnauthorizedResponse();
  return NextResponse.json(
    await getRevenueOutreachQueue(25, { origin: originFromRequest(request) }),
  );
}
