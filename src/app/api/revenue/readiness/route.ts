import { NextResponse } from "next/server";
import {
  isOperatorContext,
  operatorUnauthorizedResponse,
} from "@/lib/operator-auth";
import { getRevenueReadiness } from "@/lib/revenue-readiness";
import { originFromRequest } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isOperatorContext())) return operatorUnauthorizedResponse();
  return NextResponse.json(
    await getRevenueReadiness({ origin: originFromRequest(request) }),
  );
}
