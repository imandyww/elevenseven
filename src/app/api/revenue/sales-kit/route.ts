import { NextResponse } from "next/server";
import {
  isOperatorContext,
  operatorUnauthorizedResponse,
} from "@/lib/operator-auth";
import { getRevenueSalesKit } from "@/lib/revenue-sales-kit";
import { originFromRequest } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isOperatorContext())) return operatorUnauthorizedResponse();
  return NextResponse.json(
    getRevenueSalesKit({ origin: originFromRequest(request) }),
  );
}
